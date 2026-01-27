import { UserEntity } from 'src/user/entities/user.entity';
import { LatenessEntity } from './lateness.entity';

export class LatenessCommentEntity {
	id: number;
	type: string;
	comment: string;
	user?: UserEntity;
	userId: number;
	lateness?: LatenessEntity;
	latenessId: number;
	createdAt: Date;
}
