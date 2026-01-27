import { ICrmRealizationLinkedListEmployeeValue } from '@fsd/entities/crm-realization';
import { IStaffEntity } from '@fsd/entities/staff';

export interface IEmployeeProps {
	user: IStaffEntity;
	parentUserId: number;
	report: ICrmRealizationLinkedListEmployeeValue | null;
}
