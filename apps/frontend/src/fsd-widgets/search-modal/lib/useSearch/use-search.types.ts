import { IStaffEntity } from '@fsd/entities/staff';

export interface IUseSearchResponse {
	id: string | number;
	type: 'organization' | 'contact';
	name: string;
	description: string;
	userId: number | string | undefined;
	user: IStaffEntity | undefined;
	isArchive: boolean;
	requisites?: string[];
}

export interface IUseSearchGroupedResponse {
	organizations: IUseSearchResponse[];
	contacts: IUseSearchResponse[];
}
