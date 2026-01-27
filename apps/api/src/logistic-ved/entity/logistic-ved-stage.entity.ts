import { UserRoleEntity } from 'src/user-role/entities/user-role.entity';
import { LogisticVedOrderEntity } from './logistic-ved-order.entity';

export class LogisticVedStageEntity {
	id: number;
	name: string;
	description: string;
	alias: string;
	warningTime: number;
	errorTime: number;
	orderCount?: number;
	position: number;
	isHide: boolean;

	actionExpected?: UserRoleEntity;
	actionExpectedId?: number;
	orders?: LogisticVedOrderEntity[];

	createdAt: Date;
	updatedAt: Date;
}
