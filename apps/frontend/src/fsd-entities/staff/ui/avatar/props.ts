import { IStaffEntity, IStaffVoip } from '@fsd/entities/staff';
import { AvatarPropsSize } from '@fsd/shared/ui-kit';
import { IUserAllInfoResponse } from '@interfaces/user/UserAllInfo.response';
import { IUserResponse } from '@interfaces/user/UserList.response';

export interface StaffAvatarProps {
	user: IStaffEntity | IUserResponse | IUserAllInfoResponse | IStaffVoip;
	size?: (typeof AvatarPropsSize)[number];
	className?: string;
	disabled?: boolean;
	onClick?: () => void;
}
