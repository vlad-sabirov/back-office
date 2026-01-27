import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now } from 'mongoose';

@Schema({
	_id: false,
	timestamps: false,
	versionKey: false,
})
export class WorkingBaseOrganizationModel {
	@Prop({ required: true })
	userId: number;

	@Prop({ required: true })
	organizationId: number;

	@Prop({ required: true })
	lastUpdate: Date;

	@Prop({ default: now() })
	createdAt?: Date;

	@Prop({ default: now() })
	updatedAt?: Date;
}
export const WorkingBaseOrganizationsSchema = SchemaFactory.createForClass(
	WorkingBaseOrganizationModel,
);
