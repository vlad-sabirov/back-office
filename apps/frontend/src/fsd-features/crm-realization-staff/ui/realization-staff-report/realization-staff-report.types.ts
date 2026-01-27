import { ICrmRealizationLinkedListAllValue } from '@fsd/entities/crm-realization';

export interface IRealizationStaffReportProps {
	data: ICrmRealizationLinkedListAllValue | null;
	withDiff?: boolean;
	isFullAccess?: boolean;
}
