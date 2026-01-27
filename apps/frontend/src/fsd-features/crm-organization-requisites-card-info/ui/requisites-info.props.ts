import { ICrmOrganizationRequisiteEntity } from "@fsd/entities/crm-organization-requisite";

export interface IRequisitesInfoProps {
	requisites: ICrmOrganizationRequisiteEntity[] | undefined;
	organizationId: number | string | null;
}
