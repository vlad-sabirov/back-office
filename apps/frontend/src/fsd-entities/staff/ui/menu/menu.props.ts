import { ReactNode } from 'react';
import { IUserResponse } from '@interfaces/user/UserList.response';
import { IStaffEntity } from '../../staff.entity';

export interface IMenuStaffProps {
	user: IUserResponse | IStaffEntity;
	content?: ReactNode;
	children: ReactNode;
	className?: string;
}
