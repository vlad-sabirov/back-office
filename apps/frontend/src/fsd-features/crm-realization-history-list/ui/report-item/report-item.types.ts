import {
	ICrmRealizationLinkedListAll,
	ICrmRealizationMonthResAll,
	ICrmRealizationMonthResEmployee,
	ICrmRealizationMonthResTeam,
} from '@fsd/entities/crm-realization';

export interface IReportProps {
	data:
		| Omit<ICrmRealizationMonthResAll, 'teams'>
		| Omit<ICrmRealizationMonthResTeam, 'employees'>
		| ICrmRealizationMonthResEmployee;
	all: ICrmRealizationLinkedListAll | null;
	userId: number;
	parentId: number;
	withDiff?: boolean;
	type: 'team' | 'employee';
	setCurrentReport?: (report: ICrmRealizationMonthResTeam | ICrmRealizationMonthResEmployee | null) => void;
	setIsShowWhatIf?: (isShowWhatIf: boolean) => void;
}
