import { IStaffEntity } from '../staff.entity';

export interface IStaffReducer {
	data: {
		team: IStaffEntity[];
		sales: IStaffEntity[];
		all: IStaffEntity[];
		worked: IStaffEntity[];
		voip: Record<string, IStaffVoip>;
	};
}

export interface IStaffVoip {
	id: number;
	name: string;
	sex: string;
	phoneVoip?: string;
	phoneMobile?: string;
	photo?: string;
	color?: string;
	initial?: string;
}
