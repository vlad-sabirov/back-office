import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { SearchModule } from 'src/search/search.module';
import { NotificationModule } from 'src/notification/notification.module';

import {
	ContactController,
	EmailController,
	HistoryController,
	OrganizationController,
	OrganizationRequisiteController,
	OrganizationTagController,
	OrganizationTypeController,
	PhoneController,
	ReportRealizationController,
} from './controllers';
import { TaskController } from './controllers/task.controller';
import { CalendarEventController } from './controllers/calendar-event.controller';
import { CalendarParticipantController } from './controllers/calendar-participant.controller';
import { CalendarReminderController } from './controllers/calendar-reminder.controller';
import { NoteController } from './controllers/note.controller';

import {
	ContactService,
	EmailService,
	HistoryService,
	OrganizationService,
	OrganizationRequisiteService,
	OrganizationTagService,
	OrganizationTypeService,
	PhoneService,
	ReportRealizationService,
} from './services';
import { TaskService } from './services/task.service';
import { CalendarEventService } from './services/calendar-event.service';
import { TaskNotificationService } from './services/task-notification.service';
import { CalendarEventNotificationService } from './services/calendar-event-notification.service';
import { CalendarParticipantService } from './services/calendar-participant.service';
import { CalendarReminderService } from './services/calendar-reminder.service';
import { NoteService } from './services/note.service';

@Module({
	imports: [SearchModule, AuthModule, HttpModule, forwardRef(() => NotificationModule)],
	controllers: [
		ContactController,
		EmailController,
		HistoryController,
		OrganizationController,
		OrganizationRequisiteController,
		OrganizationTypeController,
		OrganizationTagController,
		PhoneController,
		ReportRealizationController,
		TaskController,
		CalendarEventController,
		CalendarParticipantController,
		CalendarReminderController,
		NoteController,
	],
	providers: [
		ContactService,
		EmailService,
		HistoryService,
		OrganizationService,
		OrganizationTypeService,
		OrganizationTagService,
		OrganizationRequisiteService,
		PhoneService,
		ReportRealizationService,
		TaskService,
		CalendarEventService,
		TaskNotificationService,
		CalendarEventNotificationService,
		CalendarParticipantService,
		CalendarReminderService,
		NoteService,
	],
	exports: [TaskService, CalendarEventService, OrganizationService],
})
export class CrmModule {}
