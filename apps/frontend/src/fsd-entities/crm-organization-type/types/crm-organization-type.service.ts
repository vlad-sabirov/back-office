import { ICrmOrganizationTypeEntity } from "./crm-organization-type.entity";

export interface ICrmOrganizationTypeApiAdd {
	name: string;
}

export interface ICrmOrganizationTypeApiEdit {
	id: string | number;
	updateDto: Partial<ICrmOrganizationTypeApiAdd>
}

export interface ICrmOrganizationTypeApiGet {
	where: Partial<Record<keyof ICrmOrganizationTypeEntity, unknown>>;
	include?: Record<string, unknown>;
	filter?: Record<string, unknown>;
}
