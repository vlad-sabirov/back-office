import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now } from 'mongoose';

@Schema({
	_id: false,
	timestamps: false,
	versionKey: false,
})
export class RealizationMonthEmployeeModel {
	@Prop({ required: true })
	userId: number;

	@Prop({ required: true })
	plan: number;

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

	@Prop({ default: now() })
	createdAt?: Date;

	@Prop({ default: now() })
	updatedAt?: Date;
}

export const RealizationMonthEmployeeSchema = SchemaFactory.createForClass(
	RealizationMonthEmployeeModel,
);
