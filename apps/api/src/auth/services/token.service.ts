import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common';
import { DateTimeHelper } from '../../helpers';
import { AuthConstants } from '../auth.constants';
import { PayloadEntity, TokensEntity } from '../entity';

@Injectable()
export class TokenService extends PrismaService {
	constructor(private readonly jwtService: JwtService, private readonly dateTimeHelper: DateTimeHelper) {
		super();
	}

	public validateAccessToken(token: string) {
		try {
			return this.jwtService.verify(token, {
				secret: process.env.ACCESS_TOKEN_SECRET,
				ignoreExpiration: false,
			});
		} catch (error) {
			throw new HttpException(AuthConstants.ERROR_UNAUTHORIZE, HttpStatus.UNAUTHORIZED);
		}
	}

	public findRefreshToken = async (token: string) => {
		await this.clearDeathAuthData();
		const findAuth = await this.auth.findFirst({ where: { token: token } });
		if (!findAuth) throw new HttpException(AuthConstants.ERROR_TOKEN_NOT_FOUND, HttpStatus.NOT_FOUND);
		return this.validateRefreshToken(token);
	};

	public validateRefreshToken(token: string) {
		try {
			return this.jwtService.verify(token, {
				secret: process.env.REFRESH_TOKEN_SECRET,
				ignoreExpiration: false,
			});
		} catch (error) {
			throw new HttpException(AuthConstants.ERROR_UNAUTHORIZE, HttpStatus.UNAUTHORIZED);
		}
	}

	public async generateAccessToken(payload: PayloadEntity): Promise<string> {
		return this.jwtService.sign(payload, {
			secret: process.env.ACCESS_TOKEN_SECRET,
			expiresIn: process.env.ACCESS_TOKEN_SECRET_EXPIRATION_TIME,
		});
	}

	public async generateRefreshToken(payload: PayloadEntity): Promise<string> {
		return this.jwtService.sign(payload, {
			secret: process.env.REFRESH_TOKEN_SECRET,
			expiresIn: process.env.REFRESH_TOKEN_SECRET_EXPIRATION_TIME,
		});
	}

	public async generateTokes(payload: PayloadEntity): Promise<TokensEntity> {
		return {
			accessToken: await this.generateAccessToken(payload),
			refreshToken: await this.generateRefreshToken(payload),
		};
	}

	public async saveRefreshToken(userId: number, token: string): Promise<void> {
		const lifeTimeAt = new Date(
			Date.now() +
				(await this.dateTimeHelper.timeShortToMilliseconds(process.env.REFRESH_TOKEN_SECRET_EXPIRATION_TIME))
		);

		await this.auth.create({
			data: {
				userId,
				token,
				lifeTimeAt,
			},
		});
	}

	public updateRefreshToken = async (token: string) => {
		const findToken = await this.auth.findFirst({ where: { token: token } });
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { iat, exp, ...tokenData } = await this.validateRefreshToken(token);
		const newToken = await this.generateRefreshToken(tokenData);
		const lifeTimeAt = new Date(
			Date.now() +
				(await this.dateTimeHelper.timeShortToMilliseconds(process.env.REFRESH_TOKEN_SECRET_EXPIRATION_TIME))
		);
		return await this.auth.update({
			where: { id: findToken.id },
			data: { token: newToken, lifeTimeAt },
		});
	};

	private async clearDeathAuthData(): Promise<void> {
		await this.auth.deleteMany({
			where: {
				lifeTimeAt: {
					lt: new Date(Date.now()),
				},
			},
		});
	}
}
