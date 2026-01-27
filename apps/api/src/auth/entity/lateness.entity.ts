import { UserEntity } from 'src/user/entities/user.entity';

export class LatenessEntity {
	id?: number;
	user?: UserEntity;
	userId: number;
	type: string;
	comment: string;
	isSkipped?: boolean;
	metaInfo: string;
	createdAt: Date;
}

export class LatenessEntityGrouped {
	arrived?: LatenessEntityGroupedArrived[];
	lateness?: LatenessEntityGroupedLateness[];
	didCome?: LatenessEntityGroupedDidCome[];
}

interface LatenessEntityGroupedArrived {
	id: number;
	date: string;
	time: string;
	comment: string;
	metaInfo: string;
	isSkipped?: boolean;
}

interface LatenessEntityGroupedLateness {
	id: number;
	date: string;
	time: string;
	latenessMinutes: number;
	comment: string;
	metaInfo: string;
	isSkipped?: boolean;
}

interface LatenessEntityGroupedDidCome {
	date: string;
	comment: string;
	metaInfo: string;
	isSkipped?: boolean;
}
