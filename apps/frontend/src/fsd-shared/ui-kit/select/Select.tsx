import { ForwardedRef, forwardRef, useState } from 'react';
import cn from 'classnames';
import { Select as MantineSelect } from '@mantine/core';
import { SelectProps } from './Select.props';
import css from './Styles.module.scss';

export const Select = forwardRef<HTMLInputElement, SelectProps>(
	(
		{ size = 'medium', variant = 'white', iconLeft, className, ...props }: SelectProps,
		ref: ForwardedRef<HTMLInputElement>
	): JSX.Element => {
		const [value, setValue] = useState<string>(props.defaultValue as string);
		const [isFocused, setFocus] = useState<boolean>(false);

		const classNames = cn(
			{
				[css.root]: true,
				[css.sizeMedium]: size === 'medium',
				[css.sizeLarge]: size === 'large',
				[css.variantWhite]: variant === 'white',
				[css.variantWhiteFilled]: variant === 'white' && !isFocused && value?.length > 0,
				[css.variantWhiteFocused]: variant === 'white' && isFocused,
				[css.variantGray]: variant === 'gray',
				[css.variantGrayFilled]: variant === 'gray' && !isFocused && value?.length > 0,
				[css.variantGrayFocused]: variant === 'gray' && isFocused,
				[css.error]: props.error,
				[css.errorFocused]: props.error && isFocused,
			},
			className,
			{ [css.disabled]: props.disabled }
		);

		return (
			<MantineSelect
				className={classNames}
				icon={iconLeft}
				onFocus={() => setFocus(true)}
				onBlur={(event) => {
					setFocus(false);
					setValue(event.currentTarget.value);
				}}
				{...props}
				ref={ref}
			/>
		);
	}
);

Select.displayName = 'Select';
