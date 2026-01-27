import { forwardRef, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TelegramService } from './services/telegram.service';
import { TelegramController } from './controllers/telegram.controller';
import { CronBirthdayService } from './services/cron/birthday';
import { CronController } from './controllers/cron.controller';
import { UserModule } from 'src/user/user.module';
import { CronLatenessService } from './services/cron/lateness';
import { ProductionCalendarModule } from '../production-calendar/production-calendar.module';
import { VacationCalendarModule } from '../vacation-calendar/vacation-calendar.module';

@Module({
	providers: [NotificationService, TelegramService, CronBirthdayService, CronLatenessService],
	controllers: [NotificationController, TelegramController, CronController],
	exports: [TelegramService],
	imports: [forwardRef(() => UserModule), ProductionCalendarModule, VacationCalendarModule],
})
export class NotificationModule {}
