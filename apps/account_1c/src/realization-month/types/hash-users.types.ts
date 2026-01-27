export interface IHashUserTypes {
	name: string;
	userId: number;
	code: string;
}

export type IHashTeamTypes = IHashUserTypes & {
	employees: IHashUserTypes[];
};
