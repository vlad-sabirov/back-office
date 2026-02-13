import { forwardRef, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TelegramService } from './services/telegram.service';
import { TelegramController } from './controllers/telegram.controller';
import { CronBirthdayService } from './services/cron/birthday';
import { CronLatenessService } from './services/cron/lateness';
import { CronTaskReminderService } from './services/cron/task-reminder';
import { CronOrganizationPowerService } from './services/cron/organization-power';
import { CronCalendarEventService } from './services/cron/calendar-event';
import { CronController } from './controllers/cron.controller';
import { UserModule } from 'src/user/user.module';
import { ProductionCalendarModule } from '../production-calendar/production-calendar.module';
import { VacationCalendarModule } from '../vacation-calendar/vacation-calendar.module';

@Module({
	providers: [
		NotificationService,
		TelegramService,
		CronBirthdayService,
		CronLatenessService,
		CronTaskReminderService,
		CronOrganizationPowerService,
		CronCalendarEventService,
	],
	controllers: [NotificationController, TelegramController, CronController],
	exports: [TelegramService],
	imports: [forwardRef(() => UserModule), ProductionCalendarModule, VacationCalendarModule],
})
export class NotificationModule {}
