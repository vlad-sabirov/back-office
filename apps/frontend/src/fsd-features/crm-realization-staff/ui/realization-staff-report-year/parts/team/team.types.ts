import { IStaffEntity } from '@fsd/entities/staff';
import { ICrmRealizationGetDataTeam } from '@fsd/widgets/crm-realization-analytics';

export interface ITeamProps {
	teamReport: ICrmRealizationGetDataTeam;
	diff: ICrmRealizationGetDataTeam | undefined;
	withDiff?: boolean;
	isFullAccess?: boolean;
	staffHashMap: Map<number, IStaffEntity>;
}
