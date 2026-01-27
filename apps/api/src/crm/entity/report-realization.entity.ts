import { UserEntity } from '../../user/entities/user.entity';

export type ReportRealizationEntity = {
	id: number;
	year: number;
	month: number;
	plan: number;
	realization: number;
	customerCount: number;
	customerNew: number;
	customerShipment: number;
	shipmentCount: number;
	// -------
	user?: UserEntity;
	userId?: number;
	// -------
	createdAt: Date;
	updatedAt: Date;
}
