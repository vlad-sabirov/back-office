import { ICrmRealizationGetDataTeam } from '@fsd/widgets/crm-realization-analytics';

export interface IRealizationStaffReportProps {
	teams: ICrmRealizationGetDataTeam[];
	diff: ICrmRealizationGetDataTeam[];
	withDiff?: boolean;
	isFullAccess?: boolean;
}
