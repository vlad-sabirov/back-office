import { IStaffEntity } from '@fsd/entities/staff';
import { ICrmRealizationGetDataEmployee } from '@fsd/widgets/crm-realization-analytics';

export interface IEmployeeProps {
	employeeReport: ICrmRealizationGetDataEmployee;
	diff: ICrmRealizationGetDataEmployee | undefined;
	withDiff?: boolean;
	isFullAccess?: boolean;
	staffHashMap: Map<number, IStaffEntity>;
}
