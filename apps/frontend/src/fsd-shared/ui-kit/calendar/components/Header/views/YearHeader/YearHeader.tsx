import { FC, useContext } from 'react';
import { isDisplayYearNow } from './utils';
import cn from 'classnames';
import { addYears, differenceInYears, format, isSameMonth, subYears } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { Icon, TextField } from '@fsd/shared/ui-kit';
import TailwindColors from '@config/tailwind/color';
import { Loader } from '@mantine/core';
import { YearHeaderProps } from '.';
import css from './YearHeader.module.scss';

export const YearHeader: FC<YearHeaderProps> = observer(({ ctx, className, ...props }) => {
	const CalendarStore = useContext(ctx);

	const isMoreWithinFromNow = isDisplayYearNow(CalendarStore.min, CalendarStore.max);
	const isLessMinFromDate = CalendarStore.min && differenceInYears(CalendarStore.date, CalendarStore.min) <= 0;
	const isMoreMaxFromDate = CalendarStore.max && differenceInYears(CalendarStore.date, CalendarStore.max) >= 0;

	const handleNowDate = () => CalendarStore.setDate(new Date());
	const handlePrevDate = () => CalendarStore.setDate(subYears(CalendarStore.date, 1));
	const handleNextDate = () => CalendarStore.setDate(addYears(CalendarStore.date, 1));

	return (
		<div className={cn(css.root, className)} {...props}>
			{isMoreWithinFromNow && (
				<TextField
					className={css.nowMonth}
					disabled={isSameMonth(CalendarStore.date, new Date()) || CalendarStore.loading}
					onClick={handleNowDate}
				>
					Текущий год
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

			<TextField className={css.displayMonth} disabled={CalendarStore.loading}>
				{format(CalendarStore.date, 'yyyy')}
			</TextField>

			{CalendarStore.loading && <Loader size="xs" variant="bars" color={TailwindColors.neutral[100]} />}
		</div>
	);
});
