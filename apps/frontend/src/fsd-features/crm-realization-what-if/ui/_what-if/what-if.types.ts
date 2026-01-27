import { ICrmRealizationMonthResEmployee, ICrmRealizationMonthResTeam } from '@fsd/entities/crm-realization';

export interface IWhatIfProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	report: ICrmRealizationMonthResTeam | ICrmRealizationMonthResEmployee | null;
}
