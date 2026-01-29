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
	],
	exports: [TaskService, OrganizationService],
})
export class CrmModule {}
