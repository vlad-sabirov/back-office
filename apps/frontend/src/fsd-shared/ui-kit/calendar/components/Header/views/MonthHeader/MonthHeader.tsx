import { FC, useContext } from 'react';
import { isDisplayMonthNow } from './utils';
import cn from 'classnames';
import { addMonths, differenceInMonths, format, isSameMonth, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { observer } from 'mobx-react-lite';
import TailwindColors from '@config/tailwind/color';
import { DateMonthPicker, Icon, TextField } from '@fsd/shared/ui-kit';
import { Loader } from '@mantine/core';
import { MonthHeaderProps } from '.';
import css from './MonthHeader.module.scss';

export const MonthHeader: FC<MonthHeaderProps> = observer(({ ctx, className, ...props }) => {
	const CalendarStore = useContext(ctx);

	const isMoreWithinFromNow = isDisplayMonthNow(CalendarStore.min, CalendarStore.max);
	const isLessMinFromDate = CalendarStore.min && differenceInMonths(CalendarStore.date, CalendarStore.min) <= 0;
	const isMoreMaxFromDate = CalendarStore.max && differenceInMonths(CalendarStore.date, CalendarStore.max) >= 0;

	const handleNowDate = () => CalendarStore.setDate(new Date());
	const handlePrevDate = () => CalendarStore.setDate(subMonths(CalendarStore.date, 1));
	const handleNextDate = () => CalendarStore.setDate(addMonths(CalendarStore.date, 1));

	return (
		<div className={cn(css.root, className)} {...props}>
			{isMoreWithinFromNow && (
				<TextField
					className={css.nowMonth}
					disabled={isSameMonth(CalendarStore.date, new Date()) || CalendarStore.loading}
					onClick={handleNowDate}
				>
					Текущий месяц
				</TextField>
			)}

			<Icon
				name="arrow-small"
				className={cn(css.prevMonth, { [css.prevMonth__disabled]: isLessMinFromDate })}
				onClick={handlePrevDate}
				disabled={CalendarStore.loading}
			/>

			<Icon
				name="arrow-small"
				className={cn(css.nextMonth, { [css.nextMonth__disabled]: isMoreMaxFromDate })}
				onClick={handleNextDate}
				disabled={CalendarStore.loading}
			/>

			<DateMonthPicker
				onChange={(event) => {
					if (!event) return;
					CalendarStore.setDate(new Date(Number(event.year), Number(event.month) - 1, 1));
				}}
				value={{ year: format(CalendarStore.date, 'yyyy'), month: format(CalendarStore.date, 'MM') }}
				minDate={CalendarStore.min}
				maxDate={CalendarStore.max}
				target={
					<TextField className={css.displayMonth} disabled={CalendarStore.loading}>
						{format(CalendarStore.date, 'LLLL yyyy', { locale: ru })}
					</TextField>
				}
				disabled={CalendarStore.loading}
			/>

			{CalendarStore.loading && <Loader size="xs" variant="bars" color={TailwindColors.neutral[100]} />}
		</div>
	);
});
