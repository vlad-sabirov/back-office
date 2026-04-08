export interface IStaffEntity {
	type: 'contact' | 'organization';
	name: string;
	id: number | string;
	orgName?: string;
	orgId?: number;
}
