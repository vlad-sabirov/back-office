import { UserEntity } from '../../user/entities/user.entity';
import { 
	OrganizationEntity, 
	EmailEntity, 
	PhoneEntity, 
	HistoryEntity 
} from '.';

export type ContactEntity = {
	id: number;
	name: string;
	workPosition: string;
	birthday?: Date;
	comment?: string;
	// -------
	user?: UserEntity;
	userId?: number;
	organizations?: OrganizationEntity[];
	phones?: PhoneEntity[];
	emails?: EmailEntity[];
	history?: HistoryEntity[];
	// -------
	isVerified: boolean;
	isArchive: boolean;
	createdAt: Date;
	updatedAt: Date;
}
