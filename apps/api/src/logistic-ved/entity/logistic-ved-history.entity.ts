import { UserEntity } from 'src/user/entities/user.entity';
import { LogisticVedOrderEntity } from './logistic-ved-order.entity';

export class LogisticVedHistoryEntity {
	id: number;
	title: string;
	description: string;
	secret?: string;
	isHide: boolean;

	author?: UserEntity;
	authorId?: number;
	order?: LogisticVedOrderEntity;
	orderId?: number;

	createdAt: Date;
	updatedAt: Date;
}
