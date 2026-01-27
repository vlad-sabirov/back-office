import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MsCrmModule } from '../ms-crm/ms-crm.module';
import { WorkingBaseService } from './working-base.service';
import { WorkingBaseController } from './working-base.controller';

import {
	WorkingBaseModel,
	WorkingBaseSchema,
} from './models/working-base.model';

@Module({
	imports: [
		MsCrmModule,
		MongooseModule.forFeature([
			{
				name: WorkingBaseModel.name,
				schema: WorkingBaseSchema,
			},
		]),
	],
	providers: [WorkingBaseService],
	controllers: [WorkingBaseController],
	exports: [WorkingBaseService],
})
export class WorkingBaseModule {}
