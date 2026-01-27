import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Ms1cModule } from '../ms-1c/ms-1c.module';
import { MsCrmModule } from '../ms-crm/ms-crm.module';
import { RealizationMonthService } from './realization-month.service';
import { RealizationMonthController } from './realization-month.controller';

import {
	RealizationMonthModel,
	RealizationMonthSchema,
} from './models/realization-month-all.model';
import { WorkingBaseModule } from 'src/working-base/working-base.module';

@Module({
	imports: [
		Ms1cModule,
		MsCrmModule,
		WorkingBaseModule,
		MongooseModule.forFeature([
			{
				name: RealizationMonthModel.name,
				schema: RealizationMonthSchema,
			},
		]),
	],
	providers: [RealizationMonthService],
	controllers: [RealizationMonthController],
})
export class RealizationMonthModule {}
