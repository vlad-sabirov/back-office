import { ICrmRealizationLinkedListTeamValue } from '@fsd/entities/crm-realization';
import { IStaffEntity } from '@fsd/entities/staff';

export interface ITeamProps {
	user: IStaffEntity;
	report: ICrmRealizationLinkedListTeamValue | null;
}
