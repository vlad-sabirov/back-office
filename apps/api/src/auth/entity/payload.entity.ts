export interface PayloadEntity {
	id: number;
	username: string;
	firstName: string;
	lastName: string;
	phoneVoip: number;
	color: string;
	photo: string;
	roles: string[];
	parent?: number;
	child?: number[];
}
