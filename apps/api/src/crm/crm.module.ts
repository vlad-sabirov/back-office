import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { SearchModule } from 'src/search/search.module';

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

@Module({
	imports: [SearchModule, AuthModule, HttpModule],
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
	],
})
export class CrmModule {}
