import {
	ICrmRealizationLinkedListAllValue,
	ICrmRealizationMonthResEmployee,
	ICrmRealizationMonthResTeam,
} from '@fsd/entities/crm-realization';
import { IStaffEntity } from '@fsd/entities/staff';

export interface IEmployeeProps {
	employeeReport: ICrmRealizationMonthResEmployee;
	dataReport: ICrmRealizationLinkedListAllValue | null;
	withDiff?: boolean;
	isFullAccess?: boolean;
	staffHashMap: Map<number, IStaffEntity>;
	setCurrentReport?: (report: ICrmRealizationMonthResTeam | ICrmRealizationMonthResEmployee | null) => void;
	setIsShowWhatIf?: (isShowWhatIf: boolean) => void;
}
