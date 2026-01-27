import { ComponentPropsWithoutRef, forwardRef } from 'react';
import { Avatar, TextField } from '@fsd/shared/ui-kit';
import { CloseButton, MultiSelectValueProps } from '@mantine/core';
import css from '../styles/ModeStaff.module.scss';

interface IDataInput extends Omit<ComponentPropsWithoutRef<'div'>, 'value'> {
	label: string;
	value: string;
	letters: string;
	photo: string;
}

export const ModeStaffInput = forwardRef<HTMLDivElement, IDataInput>(({ label, ...others }, ref): JSX.Element => {
	const avatar = (
		<Avatar className={css.itemAvatar} size="small" color={others.color} text={others.letters} src={others.photo} />
	);

	return (
		<div ref={ref} {...others}>
			<div className={css.itemWrapper}>
				{avatar}
				<TextField size="small" className={css.itemName}>
					{label}
				</TextField>
			</div>
		</div>
	);
});
ModeStaffInput.displayName = 'ModeStaffInput';

interface IDataInput extends MultiSelectValueProps {
	label: string;
	value: string;
	letters: string;
	photo: string;
}

export const ModeStaffValue = ({ label, onRemove, ...others }: IDataInput & { value: string }) => {
	const avatar = (
		<Avatar
			className={css.valueAvatar}
			size="extraSmall"
			color={others.color}
			text={others.letters}
			src={others.photo}
		/>
	);

	return (
		<div>
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
