import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService, TokenService, PinCodeService, LatenessService, LatenessCommentService } from './services';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { DateTimeHelper } from '../helpers';
import { NotificationModule } from 'src/notification/notification.module';
import { LatenessController } from './controllers/lateness.controller';
import { LatenessCommentController } from './controllers/lateness-comment.controller';
import { ProductionCalendarModule } from '../production-calendar/production-calendar.module';
import { VacationCalendarModule } from '../vacation-calendar/vacation-calendar.module';

@Module({
	providers: [AuthService, TokenService, PinCodeService, LatenessService, LatenessCommentService, DateTimeHelper],
	controllers: [AuthController, LatenessController, LatenessCommentController],
	imports: [
		JwtModule.register({}),
		forwardRef(() => UserModule),
		NotificationModule,
		ProductionCalendarModule,
		VacationCalendarModule,
	],
	exports: [AuthService, TokenService, JwtModule, LatenessService],
})
export class AuthModule {}
