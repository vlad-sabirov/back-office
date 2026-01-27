export interface IEmployeeEntity {
	code: number;
	status: string;
	data: {
		code: string;
		name: string;
	}[];
}
