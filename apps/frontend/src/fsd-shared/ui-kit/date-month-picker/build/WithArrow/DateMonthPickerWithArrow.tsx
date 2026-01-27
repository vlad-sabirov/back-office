import { FC } from 'react';
import cn from 'classnames';
import { addDays, addMonths, format, isSameMonth, parse, subMonths } from 'date-fns';
import { DateMonthPicker, Icon } from '@fsd/shared/ui-kit';
import { Tooltip } from '@mantine/core';
import { DateMonthPickerWithArrowProps } from '.';
import css from './date-month-picker-with-arrow.module.scss';

const DATE_TODAY = new Date();

export const DateMonthPickerWithArrow: FC<DateMonthPickerWithArrowProps> = ({
	date,
	setDate,
	minDate,
	maxDate,
	className,
	...props
}) => {
	const handleSetDateNext = () => {
		setDate(addMonths(date, 1));
	};

	const handleSetDatePrev = () => {
		setDate(subMonths(date, 1));
	};

	const handleSetDateReset = () => {
		setDate(DATE_TODAY);
	};

	return (
		<div className={cn(css.wrapper, className)} {...props}>
			<Tooltip label={'Предыдущий месяц'} openDelay={400} disabled={minDate ? isSameMonth(date, minDate) : false}>
				<div>
					<Icon
						name={'arrow-small'}
						className={css.wrapper__iconPrev}
						disabled={minDate ? isSameMonth(date, minDate) : false}
						onClick={handleSetDatePrev}
					/>
				</div>
			</Tooltip>

			<Tooltip label={'Сбросить'} openDelay={400} disabled={isSameMonth(date, DATE_TODAY)}>
				<div>
					<Icon name={'history'} disabled={isSameMonth(date, DATE_TODAY)} onClick={handleSetDateReset} />
				</div>
			</Tooltip>

			<DateMonthPicker
				variant={'darkGray'}
				value={{ year: format(date, 'yyyy'), month: format(date, 'MM') }}
				onChange={(value) => {
					if (!value) return;
					setDate(addDays(parse(`${value.year}-${value.month}`, 'yyyy-MM', new Date()), 1));
				}}
				className={css.wrapper__picker}
				minDate={minDate}
				maxDate={maxDate}
			/>

			<Tooltip label={'Следующий месяц'} openDelay={400} disabled={maxDate ? isSameMonth(date, maxDate) : false}>
				<div>
					<Icon
						name={'arrow-small'}
						className={css.wrapper__iconNext}
						disabled={maxDate ? isSameMonth(date, maxDate) : false}
						onClick={handleSetDateNext}
					/>
				</div>
			</Tooltip>
		</div>
	);
};
