import { ICrmRealizationMonthResAll, ICrmRealizationMonthResTeam } from '@fsd/entities/crm-realization';

export interface IModalProps {
	isOpen: boolean;
	setIsOpen: (val: boolean) => void;
	data: Omit<ICrmRealizationMonthResAll, 'teams'>[] | Omit<ICrmRealizationMonthResTeam, 'employees'>[] | null;
	userId: number;
	parentId: number;
	type: 'team' | 'employee';
}
