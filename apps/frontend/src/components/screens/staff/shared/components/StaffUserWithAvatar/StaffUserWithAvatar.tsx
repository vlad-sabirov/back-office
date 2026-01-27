import { FC } from 'react';
import { Avatar, Menu, TextField } from '@fsd/shared/ui-kit';
import { StaffUserWithAvatarProps } from './props';
import { MenuItemStaffUser } from '@fsd/shared/ui-kit/menu/items';
import cn from 'classnames';
import css from './styles.module.scss';

export const DisplayBlock: FC<StaffUserWithAvatarProps> = (props) => {
	const { user, className, onClick } = props;

	return (
		<div className={cn(css.wrapper, className)} onClick={onClick}>
			<Avatar
				color={user.color}
				text={`${user.lastName[0]}${user.firstName[0]}`}
				src={user.photo}
				size={props.avatarSize ?? 'small'}
				disabled={props.disabled}
			/>

			<TextField className={css.name} size="small" disabled={props.disabled}>
				{user.lastName} {user.firstName}
			</TextField>
		</div>
	);
};

export const StaffUserWithAvatar: FC<StaffUserWithAvatarProps> = (props) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
	const { user, menuItems, menuDisabled, onClick, ...otherProps } = props;

	if (menuDisabled) return <DisplayBlock {...props} />;

	return (
		<>
			<Menu
				key={`territoryUserId` + user.id}
				width={250}
				offset={-12}
				control={
					<span>
						<DisplayBlock {...props} />
					</span>
				}
				{...otherProps}
			>
				<MenuItemStaffUser data={user} content={props.content} />
				{menuItems}
			</Menu>
		</>
	);
};
