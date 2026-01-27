import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { AuthConstants } from '../auth.constants';
import { AuthService } from '../services';
import { TokenService } from '../services';

@Injectable()
export class AccessGuard implements CanActivate {
	constructor(
		private readonly authService: AuthService,
		private readonly tokenService: TokenService,
		private readonly jwtService: JwtService,
		private readonly reflector: Reflector
	) {}

	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const req = context.switchToHttp().getRequest();
		let user;

		// Проверка авторизации
		try {
			const bearer = req.headers.authorization.split(' ')[0];
			const token = req.headers.authorization.split(' ')[1];

			if (bearer !== 'Bearer' || !token)
				throw new HttpException(AuthConstants.ERROR_UNAUTHORIZE, HttpStatus.UNAUTHORIZED);

			user = this.tokenService.validateAccessToken(token);
		} catch (error) {
			throw new HttpException(AuthConstants.ERROR_UNAUTHORIZE, HttpStatus.UNAUTHORIZED);
		}

		// Проверка доступов
		try {
			const accesses = this.reflector.getAllAndOverride<string[]>('access', [
				context.getHandler(),
				context.getClass(),
			]);

			if (!accesses) return true;

			if (!user.roles.some((access) => accesses.includes(access))) {
				throw new HttpException(AuthConstants.ERROR_ACCESS_DENIED, HttpStatus.FORBIDDEN);
			}
		} catch (error) {
			throw new HttpException(AuthConstants.ERROR_ACCESS_DENIED, HttpStatus.FORBIDDEN);
		}

		return true;
	}
}
