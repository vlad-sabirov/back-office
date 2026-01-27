import { UserEntity } from 'src/user/entities/user.entity';

export class VacationEntity {
	id: number;
	comment?: string;
	dateStart: Date;
	dateEnd: Date;
	isFake: boolean;
	// -------
	userId: number;
	user?: UserEntity;
	// -------
	createdAt: Date;
	updatedAt: Date;
}
