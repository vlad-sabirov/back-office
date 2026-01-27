export interface IUserEntity {
	id: number;
	firstName: string;
	lastName: string;
	workPosition: string;
	sex: string;
	photo: string;
	color: string;
	phoneVoip: string;
	phoneMobile: string;
	roles: IRoles[];
	child?: IUserEntity[];
}

interface IRoles {
	id: number;
	alias: string;
}
