import { ForwardedRef, forwardRef, useState } from 'react';
import cn from 'classnames';
import 'dayjs/locale/ru';
import { DateRangePickerProps, Icon } from '@fsd/shared/ui-kit';
import { DateRangePicker as MantineRangeDatePicker } from '@mantine/dates';
import css from './Styles.module.scss';

export const DateRangePicker = forwardRef<HTMLInputElement, DateRangePickerProps>(
	(
		{ size = 'medium', variant = 'white', className, onChange, value, ...props }: DateRangePickerProps,
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
			<MantineRangeDatePicker
				className={classNames}
				icon={<Icon name="calendar" />}
				locale="ru"
				inputFormat={`DD MMM YYYY`}
				clearable={false}
				value={value}
				onChange={(changeValue) => {
					onChange?.(changeValue);
					if (changeValue[0]) setValueFilled(changeValue ? changeValue[0].toString() : '');
				}}
				onFocus={() => setFocus(true)}
				amountOfMonths={props.amountOfMonths || 3}
				onBlur={() => {
					setFocus(false);
				}}
				ref={ref}
				{...props}
			/>
		);
	}
);

DateRangePicker.displayName = 'DateRangePicker';
