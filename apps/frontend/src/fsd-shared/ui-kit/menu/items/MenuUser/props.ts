import { ReactNode } from 'react';
import { IUserResponse } from '@interfaces/user/UserList.response';

export interface MenuItemStaffUserProps {
	data: IUserResponse;
	content?: ReactNode;
	isCall?: boolean;
}
