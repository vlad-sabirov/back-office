import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now } from 'mongoose';

import {
	RealizationMonthTeamModel,
	RealizationMonthTeamSchema,
} from './realization-month-team.model';

@Schema({
	timestamps: true,
	collection: 'realization-month',
	versionKey: false,
})
export class RealizationMonthModel {
	@Prop({ required: true })
	year: number;

	@Prop({ required: true })
	month: number;

	@Prop({ required: true })
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

	@Prop({ type: [{ type: RealizationMonthTeamSchema }] })
	teams?: RealizationMonthTeamModel[];

	@Prop({ default: now() })
	createdAt?: Date;

	@Prop({ default: now() })
	updatedAt?: Date;
}

export const RealizationMonthSchema = SchemaFactory.createForClass(
	RealizationMonthModel,
);
