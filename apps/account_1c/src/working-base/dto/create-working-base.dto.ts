export interface ICreateWorkingBaseOrganization {
	userId: number;
	organizationId: number;
	lastUpdate: string;
}

export interface ICreateWorkingBaseUser {
	userId: number;
	total: number;
	active: number;
	medium: number;
	low: number;
	empty: number;
}

export interface ICreateWorkingBaseDtoObject {
	year: number;
	month: number;
	total: number;
	active: number;
	medium: number;
	mediumDuration: number;
	low: number;
	lowDuration: number;
	empty: number;
	emptyDuration: number;
	organizations: ICreateWorkingBaseOrganization[];
	users: ICreateWorkingBaseUser[];
}

export interface ICreateWorkingBaseDto {
	year: number;
	month: number;
	mediumDuration: number;
	lowDuration: number;
	emptyDuration: number;
}
