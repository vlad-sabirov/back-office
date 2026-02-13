import { FC, useContext, useEffect, useMemo, useState } from 'react';
import cn from 'classnames';
import {
	differenceInDays,
	format,
	isSameDay as isSameDayFns,
	isSameMonth as isSameMonthFns,
	isWeekend as isWeekendFns,
	parse,
} from 'date-fns';
import { observer } from 'mobx-react-lite';
import { TextField } from '@fsd/shared/ui-kit';
import { CalendarPropsEvent } from '@fsd/shared/ui-kit';
import TailwindColors from '@config/tailwind/color';
import { Loader, MantineColor, Tooltip } from '@mantine/core';
import HolidaySvg from '@public/img/holiday.svg';
import { getSortedEvents, getWeeksWithDays } from '@fsd/shared/ui-kit/calendar/utils';
import { getDateRange } from '@fsd/shared/ui-kit/calendar/utils/getDateRange/getDateRange';
import { getEventsFromDays, getEventsFromDaysResponse } from '@fsd/shared/ui-kit/calendar/utils/getEventsFromDays';
import { MonthGridProps } from '.';
import css from './MonthGrid.module.scss';

/** Собирает цвета событий дня и возвращает стили для ячейки */
const getDayCellStyle = (events?: CalendarPropsEvent[]): React.CSSProperties | undefined => {
	if (!events || events.length === 0) return undefined;

	const colors = events
		.map((e) => e.color)
		.filter((c): c is string => !!c);

	if (colors.length === 0) return undefined;

	const unique = [...new Set(colors)];

	if (unique.length === 1) {
		return { backgroundColor: unique[0] + '30' }; // 30 = ~19% opacity hex
	}

	// Градиент из уникальных цветов с полупрозрачностью
	const stops = unique.map((c, i) => {
		const pct = (i / (unique.length - 1)) * 100;
		return `${c}40 ${pct}%`; // 40 = ~25% opacity
	});

	return { background: `linear-gradient(135deg, ${stops.join(', ')})` };
};

export const MonthGrid: FC<MonthGridProps> = observer(({ ctx, className, ...props }) => {
	const CalendarStore = useContext(ctx);
	const [days, setDays] = useState<getEventsFromDaysResponse[][]>();

	useEffect(() => {
		const range = getDateRange(CalendarStore.date);
		const days = getWeeksWithDays(range.start, range.end);
		const sortedEvents = getSortedEvents(CalendarStore.events);

		if (days.length)
			setDays(days.map((daysStack) => getEventsFromDays({ dates: daysStack, events: sortedEvents })));
	}, [CalendarStore.date, CalendarStore.events]);

	return (
		<div className={cn(css.root, className)} {...props}>
			<div className={css.header}>
				<TextField className={css.headerItem}>понедельник</TextField>
				<TextField className={css.headerItem}>вторник</TextField>
				<TextField className={css.headerItem}>среда</TextField>
				<TextField className={css.headerItem}>четверг</TextField>
				<TextField className={css.headerItem}>пятница</TextField>
				<TextField className={css.headerItem}>суббота</TextField>
				<TextField className={css.headerItem}>воскресенье</TextField>
			</div>
			<div className={css.gridWrapper}>
				{CalendarStore.loading && (
					<div className={css.gridWrapper__loading}>
						<Loader size="xl" variant="bars" color={TailwindColors.primary.main as MantineColor} />
					</div>
				)}

				{!!days?.length &&
					days.map((daysStack) => {
						return daysStack.map((day, indexCol) => {
							const grid = {
								start: 1,
								end: daysStack.length,
								position: indexCol + 1,
								toStart: indexCol + 2 - 1,
								toEnd: daysStack.length - indexCol,
							};

							const dayOfMonth = format(day.date, 'd');
							const isSameDay = isSameDayFns(day.date, new Date());
							const isSameMonth = isSameMonthFns(day.date, CalendarStore.date);
							const isWeekEnd = isWeekendFns(day.date);
							const isLessMin = CalendarStore.min && differenceInDays(day.date, CalendarStore.min) < 0;
							const isMoreMax = CalendarStore.max && differenceInDays(day.date, CalendarStore.max) > 0;
							const isHoliday = day.holiday;
							const isTransfer = day.transfer;

							const dayCellStyle = (isSameMonth && !isLessMin && !isMoreMax)
								? getDayCellStyle(day.events)
								: undefined;

							return (
								<div
									key={format(day.date, 'yyyyMMdd')}
									className={cn(css.item, {
										[css.item__disabled]: !isSameMonth || isLessMin || isMoreMax,
										[css.item__hasEvents]: !!dayCellStyle,
									})}
									style={dayCellStyle}
								>
									<TextField
										size="small"
										className={cn(css.itemDayOfMonth, {
											[css.itemDayOfMonth__weekend]: isWeekEnd && !isTransfer,
											[css.itemDayOfMonth__holiday]: isHoliday,
											[css.itemDayOfMonth__active]: isSameDay,
											[css.itemDayOfMonth__disabled]: !isSameMonth || isLessMin || isMoreMax,
										})}
									>
										{dayOfMonth}
									</TextField>

									{day.holiday && (
										<Tooltip.Floating multiline label={day.holiday?.title}>
											<div
												onClick={day.holiday?.onClick}
												style={{ cursor: day.holiday?.onClick ? 'pointer' : undefined }}
											>
												<TextField size="small" className={cn(css.itemHoliday)}>
													<HolidaySvg className={css.itemHolidayIcon} />
													{day.holiday.title}
												</TextField>
											</div>
										</Tooltip.Floating>
									)}

									{day.transfer && (
										<TextField size="small" className={cn(css.itemTransfer)}>
											Перенос
										</TextField>
									)}

									{!!day.events?.length &&
										day.events.map((event) => {
											const diffToEnd =
												differenceInDays(
													parse(
														format(event.dateEnd, 'yyyy-MM-dd'),
														'yyyy-MM-dd',
														new Date()
													),
													parse(format(day.date, 'yyyy-MM-dd'), 'yyyy-MM-dd', new Date())
												) + 1;

											const toEnd = diffToEnd > grid.toEnd ? grid.toEnd : diffToEnd;
											const width = toEnd * 100 - 8 + '%';

											if (event.slot?.display) {
												const eventStyle: React.CSSProperties = {
													width: event.isManyDays ? width : undefined,
													cursor: event?.onClick ? 'pointer' : undefined,
												};
												if (event.color) {
													eventStyle.backgroundColor = event.color + '55';
													eventStyle.borderLeft = `3px solid ${event.color}`;
													eventStyle.paddingLeft = '8px';
												}
												return (
													<TextField
														onClick={event.onClick}
														className={cn(
															css.event,
															{
																[css.event__singleDay]: event.isManyDays,
																[css.event__manyDay]: event.isManyDays,
																[css.event__itemOne]:
																	event.slot?.position === 1 && event.slot?.display,
																[css.event__itemTwo]:
																	event.slot?.position === 2 && event.slot?.display,
																[css.event__itemThree]:
																	event.slot?.position === 3 && event.slot?.display,
																[css.event__itemFour]:
																	event.slot?.position === 4 && event.slot?.display,
																[css.event__itemFive]:
																	event.slot?.position === 5 && event.slot?.display,
															},
															{
																[css.event__vacation]: event.type === 'vacation',
																[css.event__colored]: !!event.color,
															}
														)}
														style={eventStyle}
														key={event.id}
													>
														{!!event.icon && (
															<div className={css.event__icon}>{event.icon}</div>
														)}
														{event.title}
													</TextField>
												);
											}
										})}
								</div>
							);
						});
					})}
			</div>
		</div>
	);
});
