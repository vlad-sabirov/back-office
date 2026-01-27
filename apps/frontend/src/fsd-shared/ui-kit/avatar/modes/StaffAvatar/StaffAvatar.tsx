import { FC } from 'react';
import { Avatar } from '@fsd/shared/ui-kit';
import { StaffAvatarProps } from '.';

export const StaffAvatar: FC<StaffAvatarProps> = (props) => {
	if (props.data)
		return (
			<Avatar
				color={props.data.color}
				text={`${props.data.lastName?.[0]}${props.data.firstName?.[0]}`}
				src={props.data.photo}
				size={props.size}
				className={props.className}
				disabled={props.disabled}
				onClick={props.onClick}
			/>
		);
	return <Avatar />;
};
