import { ForwardedRef, forwardRef, useState } from 'react';
import cn from 'classnames';
import { ModeStaffInput, ModeStaffValue, MultiSelectProps } from '@fsd/shared/ui-kit';
import { MultiSelect as MantineMultiSelect } from '@mantine/core';
import css from './Styles.module.scss';

export const MultiSelect = forwardRef<HTMLInputElement, MultiSelectProps>(
	(
		{
			mode = 'standard',
			size = 'medium',
			color = 'white',
			onChange,
			iconLeft,
			className,
			...props
		}: MultiSelectProps,
		ref: ForwardedRef<HTMLInputElement>
	): JSX.Element => {
		const [value, setValue] = useState<string[]>([]);
		const [isFocused, setFocus] = useState<boolean>(false);

		const classNames = cn(
			{
				[css.root]: true,
				[css.sizeMedium]: size === 'medium',
				[css.sizeLarge]: size === 'large',
				[css.colorWhite]: color === 'white',
				[css.colorWhiteFilled]: color === 'white' && !isFocused && value?.length > 0,
				[css.colorWhiteFocused]: color === 'white' && isFocused,
				[css.colorGray]: color === 'gray',
				[css.error]: props.error,
				[css.errorFocused]: props.error && isFocused,
			},
			className,
			{ [css.disabled]: props.disabled }
		);

		if (mode === 'staff') {
			return (
				<MantineMultiSelect
					className={classNames}
					icon={iconLeft}
					itemComponent={ModeStaffInput}
					valueComponent={ModeStaffValue}
					onChange={(value) => {
						onChange?.(value);
						setValue(value);
						setFocus(false);
					}}
					onFocus={() => setFocus(true)}
					{...props}
					ref={ref}
				/>
			);
		}

		return (
			<MantineMultiSelect
				className={classNames}
				icon={iconLeft}
				onChange={(value) => {
					onChange?.(value);
					setValue(value);
					setFocus(false);
				}}
				onFocus={() => setFocus(true)}
				{...props}
				ref={ref}
			/>
		);
	}
);

MultiSelect.displayName = 'MultiSelect';
