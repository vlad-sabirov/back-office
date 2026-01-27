import { forwardRef } from 'react';
import { TextField } from '@fsd/shared/ui-kit';
import { Avatar, CloseButton, MultiSelectValueProps, SelectItemProps } from '@mantine/core';
import css from '../styles/ModeStaff.module.scss';

export const ModeStaffInput = forwardRef<HTMLDivElement, SelectItemProps>(({ label, ...props }, ref): JSX.Element => {
	const avatar = <Avatar className={css.itemAvatar} size="sm" />;

	return (
		<div ref={ref} {...props}>
			<div className={css.itemWrapper}>
				{avatar}
				<TextField size="small" className={css.itemName}>
					{label}
				</TextField>
			</div>
		</div>
	);
});

export const ModeStaffValue = ({ label, onRemove, ...props }: MultiSelectValueProps & { value: string }) => {
	const avatar = <Avatar className={css.valueAvatar} size="xs" />;

	return (
		<div {...props}>
			<div className={css.valueWrapper}>
				{avatar}
				<TextField size="small" className={css.valueName}>
					{label}
				</TextField>
				<CloseButton
					onMouseDown={onRemove}
					variant="transparent"
					size={22}
					iconSize={14}
					tabIndex={-1}
					className={css.valueClose}
				/>
			</div>
		</div>
	);
};

ModeStaffInput.displayName = 'ModeStaffInput';
