import {
	ICrmRealizationLinkedListAll,
	ICrmRealizationMonthResAll,
	ICrmRealizationMonthResEmployee,
	ICrmRealizationMonthResTeam,
} from '@fsd/entities/crm-realization';

export interface IRealizationListProps {
	data:
		| Omit<ICrmRealizationMonthResAll, 'teams'>[]
		| Omit<ICrmRealizationMonthResTeam, 'employees'>[]
		| ICrmRealizationMonthResEmployee[]
		| null;
	all: ICrmRealizationLinkedListAll | null;
	userId: number;
	parentId: number;
	withDiff?: boolean;
	type: 'team' | 'employee';
}
