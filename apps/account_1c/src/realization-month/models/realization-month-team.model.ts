import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now } from 'mongoose';

import {
	RealizationMonthEmployeeModel,
	RealizationMonthEmployeeSchema,
} from './realization-month-employee.model';

@Schema({
	_id: false,
	timestamps: false,
	versionKey: false,
})
export class RealizationMonthTeamModel {
	@Prop({ required: true })
	userId: number;

	@Prop()
	plan?: number;

	@Prop()
	planCustomerCount?: number;

	@Prop()
	planWorkingBasePercent?: number;

	@Prop()
	realization?: number;

	@Prop()
	customerCount?: number;

	@Prop()
	customerShipment?: number;

	@Prop()
	shipmentCount?: number;

	@Prop()
	percent?: number;

	@Prop()
	depthOfSales?: number;

	@Prop()
	averageOrderValue?: number;

	@Prop()
	workingBasePercent?: number;

	@Prop({ type: [Number] })
	staffIds?: number[];

	@Prop({ type: [{ type: RealizationMonthEmployeeSchema }] })
	employees?: RealizationMonthEmployeeModel[];

	@Prop({ default: now() })
	createdAt?: Date;

	@Prop({ default: now() })
	updatedAt?: Date;
}

export const RealizationMonthTeamSchema = SchemaFactory.createForClass(
	RealizationMonthTeamModel,
);
