import { UserEntity } from 'src/user/entities/user.entity';
import { LogisticVedOrderEntity } from './logistic-ved-order.entity';

export class LogisticVedFileEntity {
	id: number;
	type: string;
	url: string;
	comment?: string;
	isHide: boolean;

	author?: UserEntity;
	authorId?: number;
	order?: LogisticVedOrderEntity;
	orderId?: number;

	createdAt: Date;
}
