import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now } from 'mongoose';

@Schema({
	_id: false,
	timestamps: false,
	versionKey: false,
})
export class WorkingBaseUserModel {
	@Prop({ required: true })
	userId: number;

	@Prop({ required: true })
	total: number;

	@Prop({ required: true })
	active: number;

	@Prop({ required: true })
	medium: number;

	@Prop({ required: true })
	low: number;

	@Prop({ required: true })
	empty: number;

	@Prop({ default: now() })
	createdAt?: Date;

	@Prop({ default: now() })
	updatedAt?: Date;
}
export const WorkingBaseUserSchema =
	SchemaFactory.createForClass(WorkingBaseUserModel);
