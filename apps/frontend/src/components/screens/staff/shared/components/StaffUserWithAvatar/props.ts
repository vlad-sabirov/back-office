import { ReactNode } from 'react';
import { AvatarPropsSize } from '@fsd/shared/ui-kit';
import { IUserResponse } from '@interfaces/user/UserList.response';

export interface StaffUserWithAvatarProps {
	user: IUserResponse;
	className?: string;
	menuItems?: ReactNode;
	menuDisabled?: boolean;
	onClick?: () => void;
	content?: ReactNode;
	avatarSize?: typeof AvatarPropsSize[number];
	disabled?: boolean;
}
