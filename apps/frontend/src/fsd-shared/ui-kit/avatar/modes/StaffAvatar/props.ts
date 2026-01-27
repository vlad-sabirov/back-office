import { IStaffEntity } from '@fsd/entities/staff';
import { AvatarPropsSize } from '@fsd/shared/ui-kit';

export interface StaffAvatarProps {
	data: IStaffEntity;
	size?: typeof AvatarPropsSize[number];
	className?: string;
	disabled?: boolean;
	onClick?: () => void;
}
