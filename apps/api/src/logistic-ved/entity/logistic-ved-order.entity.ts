import { UserEntity } from 'src/user/entities/user.entity';
import { LogisticVedCommentEntity } from './logistic-ved-comment.entity';
import { LogisticVedFileEntity } from './logistic-ved-file.entity';
import { LogisticVedStageEntity } from './logistic-ved-stage.entity';

export class LogisticVedOrderEntity {
	id?: number;
	name: string;
	isModification?: boolean;
	isDone?: boolean;
	isClose?: boolean;
	position?: number;
	isHide?: boolean;

	author?: UserEntity;
	authorId: number;
	performer?: UserEntity;
	performerId?: number;
	stage?: LogisticVedStageEntity;
	stageId?: number;
	comments?: LogisticVedCommentEntity[];
	file?: LogisticVedFileEntity[];

	createdAt?: Date;
	updatedAt?: Date;
}
