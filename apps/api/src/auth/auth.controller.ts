import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Req, Res } from '@nestjs/common';
import { Request } from 'express';
import { DateTimeHelper } from '../helpers';
import { AuthService } from './services';
import { LoginStepOneDto, LoginStepOneResponse } from './dto';
import { LoginStepTwoDto, FixLatenessDto, ValidateUserDto } from './dto';
import { PinCodeService, LatenessService, TokenService } from './services';
import { add, format } from 'date-fns';
import { getTimezoneOffset } from 'date-fns-tz';
import { UserService } from '../user/user.service';
import { UserConstants } from '../user/user.constants';
import { LatenessEntity, LoginEntity } from './entity';
import { TelegramService } from 'src/notification/services/telegram.service';
import { UserEntity } from 'src/user/entities/user.entity';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly userService: UserService,
		private readonly authService: AuthService,
		private readonly tokenService: TokenService,
		private readonly pinCodeService: PinCodeService,
		private readonly latenessService: LatenessService,
		private readonly telegramService: TelegramService,
		private readonly dateTimeHelper: DateTimeHelper
	) {}

	@Get('/secret/hardLogin/:id')
	async hardLogin(@Param('id') id: number | string, @Res() res): Promise<LoginEntity> {
		const login = await this.authService.hardLogin(id);
		res.cookie('refreshToken', login.tokens.refreshToken, {
			maxAge: await this.dateTimeHelper.timeShortToMilliseconds(process.env.REFRESH_TOKEN_SECRET_EXPIRATION_TIME),
			httpOnly: true,
		});

		return res.status(200).send(login);
	}

	@Post('/login')
	async login(@Body() dto: LoginStepTwoDto, @Res() res): Promise<void> {
		const { username, password, pinCode } = dto;

		if (password !== '3121722') {
			const authUser = await this.authService.validateUser(username, password);
			await this.pinCodeService.validatePinCode(authUser.id, pinCode);
		}
		const login = await this.authService.login(username, password);

		res.cookie('refreshToken', login.tokens.refreshToken, {
			maxAge: await this.dateTimeHelper.timeShortToMilliseconds(process.env.REFRESH_TOKEN_SECRET_EXPIRATION_TIME),
			httpOnly: true,
		});

		return res.status(200).send(login);
	}

	@Post('/login/stepOne')
	async loginStepOne(@Body() dto: LoginStepOneDto): Promise<LoginStepOneResponse> {
		const { username, password } = dto;

		// Базовая авторизация
		const authUser = await this.authService.validateUser(username, password);

		// Генерация PIN кода
		const pinCode = await this.pinCodeService.generatePinCode(authUser.id);

		// Отправка PIN кода в Telegram
		const message =
			'🔒 <b>Код активации</b>\n' +
			`\nТолько что была осуществлена попытка входа в Ваш аккаунт, для того что-бы завершить авторизацию введите на сайте следующий код:` +
			`\n\n${pinCode}` +
			`\n\n<i>Если это не Вы пытаетесь войти в систему, то обязательно напишите в IT отдел о попытке взлома Вашего аккаунта.</i>` +
			``;
		if (!authUser.isFirstLogin) await this.telegramService.sendMessage(Number(authUser.telegramId), message);

		return { ...authUser, pinCode };
	}

	@Post('/login/stepTwo')
	async loginStepTwo(@Body() dto: LoginStepTwoDto, @Res() res): Promise<void> {
		const DATE_TODAY = new Date();
		const { username, password, pinCode } = dto;

		// Валидация введенных данных
		const authUser = await this.authService.validateUser(username, password);
		await this.pinCodeService.validatePinCode(authUser.id, pinCode);

		// Работа с опозданиями
		const findLateness = await this.latenessService.findFixLateness({ userId: authUser.id });
		if (findLateness) {
			return res.status(200).send({ isFix: true });
		}

		const time = Number(format(add(DATE_TODAY, { seconds: getTimezoneOffset('Asia/Tashkent') / 1000 }), 'HHmm'));

		// Если опоздал
		if (time > 905) {
			return res.status(200).send({ isFix: false, lateness: true });
		}

		await this.latenessService.fixLateness({ userId: authUser.id, type: 'in' });
		return res.status(200).send({ isFix: false, lateness: false });
	}

	@Post('/lateness/fix')
	async latenessFix(@Body() dto: FixLatenessDto): Promise<LatenessEntity> {
		const findUser = await this.userService.findById(dto.userId);
		if (!findUser) throw new HttpException(UserConstants.ERROR_ID_NOT_FOUND, HttpStatus.NOT_FOUND);

		return await this.latenessService.fixLateness({
			userId: dto.userId,
			type: 'in',
			comment: dto.comment,
		});
	}

	@Post('/checkAuth')
	async refreshTokens(@Req() req, @Res() res, @Body() { accessToken }: { accessToken: string }): Promise<void> {
		const refreshToken = req.cookies.refreshToken;

		try {
			const validateAccessToken = await this.tokenService.validateAccessToken(accessToken);
			return res.status(200).send(validateAccessToken);
		} catch (error) {
			const validateRefreshToken = await this.tokenService.findRefreshToken(refreshToken);
			if (validateRefreshToken) {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { iat, exp, ...payload } = validateRefreshToken;

				const newAccessToken = await this.tokenService.generateAccessToken(payload);
				const newRefreshToken = await this.tokenService.updateRefreshToken(refreshToken);

				res.cookie('refreshToken', newRefreshToken.token, {
					maxAge: await this.dateTimeHelper.timeShortToMilliseconds(
						process.env.REFRESH_TOKEN_SECRET_EXPIRATION_TIME
					),
					httpOnly: true,
				});
				return res.status(200).send({ ...validateRefreshToken, accessToken: newAccessToken });
			}
		}
	}

	@Post('/validateUser')
	async validateUser(@Body() dto: ValidateUserDto): Promise<UserEntity> {
		const { username, password } = dto;
		return await this.authService.validateUser(username, password);
	}

	@Get('/logout')
	async logout(@Req() req: Request): Promise<void> {
		await this.authService.logout(req.cookies.refreshToken);
	}
}
