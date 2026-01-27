import { IMonthRes, IMonthResEmployee, IMonthResTeam } from '../../api/res';

export interface IToArrayOptions {
	reverse?: boolean;
}
export type IData = Omit<IMonthRes, 'year' | 'month' | 'teams'> | null;

export interface ILinkedListAll {
	linkedList: Record<string, ILinkedListAllValue>;
	first: ILinkedListAllValue | null;
	last: ILinkedListAllValue | null;
	toArray: (options?: IToArrayOptions) => IMonthRes[];
	getTeamByUserId: (userId: number, options?: IToArrayOptions) => IMonthResTeam[];
	getEmployeeByUserId: (userId: number, options?: IToArrayOptions) => IMonthResEmployee[];
}
export interface ILinkedListAllValue {
	data: IMonthRes;
	downToTeams: ILinkedListTeam;
	downToEmployees: ILinkedListEmployee;
	first: ILinkedListAllValue | null;
	prev: ILinkedListAllValue | null;
	next: ILinkedListAllValue | null;
	last: ILinkedListAllValue | null;
	diff: (diffNode: ILinkedListAllValue | null) => IData;
}

export interface ILinkedListTeam {
	linkedList: Record<number, ILinkedListTeamValue>;
	toArray: () => IMonthResTeam[];
}

export interface ILinkedListTeamValue {
	data: IMonthResTeam;
	upToAll: ILinkedListAllValue | null;
	downToEmployee: ILinkedListEmployee | null;
	prev: ILinkedListTeamValue | null;
	next: ILinkedListTeamValue | null;
	diff: (diffNode: ILinkedListTeamValue | null) => IData;
}

export interface ILinkedListEmployee {
	linkedList: Record<number, ILinkedListEmployeeValue>;
	toArray: () => IMonthResEmployee[];
}

export interface ILinkedListEmployeeValue {
	data: IMonthResEmployee;
	upToTeam: ILinkedListTeamValue | null;
	prev: ILinkedListEmployeeValue | null;
	next: ILinkedListEmployeeValue | null;
	diff: (diffNode: ILinkedListEmployeeValue | null) => IData;
}
