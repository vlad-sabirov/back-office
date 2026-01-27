import { ForwardedRef, forwardRef, useState } from 'react';
import cn from 'classnames';
import 'dayjs/locale/ru';
import { Icon } from '@fsd/shared/ui-kit';
import { DatePicker as MantineDatePicker } from '@mantine/dates';
import { DatePickerProps } from './props';
import css from './styles.module.scss';

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
	(
		{ size = 'medium', variant = 'white', className, onChange, value, ...props }: DatePickerProps,
		ref: ForwardedRef<HTMLInputElement>
	): JSX.Element => {
		const [isFocused, setFocus] = useState<boolean>(false);
		const [valueFilled, setValueFilled] = useState<string>(value ? value.toString() : '');

		const classNames = cn(
			{
				[css.root]: true,
				[css.sizeMedium]: size === 'medium',
				[css.sizeLarge]: size === 'large',
				[css.variantWhite]: variant === 'white',
				[css.variantWhiteFilled]: variant === 'white' && !isFocused && valueFilled.length > 0,
				[css.variantWhiteFocused]: variant === 'white' && isFocused,
				[css.variantGray]: variant === 'gray',
				[css.variantGrayFilled]: variant === 'gray' && !isFocused && valueFilled.length > 0,
				[css.variantGrayFocused]: variant === 'gray' && isFocused,
				[css.variantDarkGray]: variant === 'darkGray',
				[css.variantDarkGrayFilled]: variant === 'darkGray' && !isFocused && valueFilled?.length > 0,
				[css.error]: props.error,
				[css.errorFocused]: props.error && isFocused,
			},
			className,
			{ [css.disabled]: props.disabled }
		);

		return (
			<MantineDatePicker
				className={classNames}
				icon={<Icon name="calendar" />}
				locale="ru"
				inputFormat="D MMMM, YYYY"
				value={value}
				onChange={(changeValue) => {
					onChange?.(changeValue);
					setValueFilled(changeValue ? changeValue.toDateString() : '');
				}}
				onFocus={() => setFocus(true)}
				onBlur={() => {
					setFocus(false);
				}}
				{...props}
				ref={ref}
			/>
		);
	}
);

DatePicker.displayName = 'DatePicker';
