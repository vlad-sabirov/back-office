export interface ITeamEntity {
	code: number;
	status: string;
	data: {
		code: string;
		name: string;
		emloyees: {
			code: string;
			name: string;
		}[];
	}[];
}
