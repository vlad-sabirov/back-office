import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now } from 'mongoose';

import {
	WorkingBaseOrganizationModel,
	WorkingBaseOrganizationsSchema,
} from './working-base-organization.model';

import {
	WorkingBaseUserModel,
	WorkingBaseUserSchema,
} from './working-base-user.model';

@Schema({
	timestamps: true,
	collection: 'working-base',
	versionKey: false,
})
export class WorkingBaseModel {
	@Prop({ required: true })
	year: number;

	@Prop({ required: true })
	month: number;

	@Prop({ required: true })
	total: number;

	@Prop({ required: true })
	active: number;

	@Prop({ required: true })
	medium: number;

	@Prop({ required: true })
	mediumDuration: number;

	@Prop({ required: true })
	low: number;

	@Prop({ required: true })
	lowDuration: number;

	@Prop({ required: true })
	empty: number;

	@Prop({ required: true })
	emptyDuration: number;

	@Prop({ type: [{ type: WorkingBaseOrganizationsSchema }] })
	organizations?: WorkingBaseOrganizationModel[];

	@Prop({ type: [{ type: WorkingBaseUserSchema }] })
	users?: WorkingBaseUserModel[];

	@Prop({ default: now() })
	createdAt?: Date;

	@Prop({ default: now() })
	updatedAt?: Date;
}
export const WorkingBaseSchema = SchemaFactory.createForClass(WorkingBaseModel);
