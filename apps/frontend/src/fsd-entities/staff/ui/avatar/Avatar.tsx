import { FC } from 'react';
import { Avatar as AvatarUI } from '@fsd/shared/ui-kit';
import { StaffAvatarProps } from './props';

export const Avatar: FC<StaffAvatarProps> = (props) => {
	if (!props.user) {
		return (
			<AvatarUI size={props.size} className={props.className} disabled={props.disabled} onClick={props.onClick} />
		);
	}

	if ('name' in props.user) {
		return (
			<AvatarUI
				color={props.user.color}
				text={`${props.user.name}`}
				src={props.user.photo}
				size={props.size}
				className={props.className}
				disabled={props.disabled}
				onClick={props.onClick}
			/>
		);
	}

	return (
		<AvatarUI
			color={props.user.color}
			text={`${props.user.lastName?.[0]}${props.user.firstName?.[0]}`}
			src={props.user.photo}
			size={props.size}
			className={props.className}
			disabled={props.disabled}
			onClick={props.onClick}
		/>
	);
};
