import { FC, useContext, useEffect, useState } from 'react';
import { getDaysFromYear } from './utils/getDaysFromYear';
import cn from 'classnames';
import { format, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { observer } from 'mobx-react-lite';
import TailwindColors from '@config/tailwind/color';
import { Loader, Tooltip } from '@mantine/core';
import HolidaySvg from '@public/img/holiday.svg';
import { getEventsFromDays, getEventsFromDaysResponse } from '@fsd/shared/ui-kit/calendar/utils';
import { TextField } from '@fsd/shared/ui-kit';
import { YearGridProps } from '.';
import css from './YearGrid.module.scss';

export const YearGrid: FC<YearGridProps> = observer(({ ctx, className, ...props }) => {
	const CalendarStore = useContext(ctx);
	const [days, setDays] = useState<getEventsFromDaysResponse[][]>();

	useEffect(() => {
		const days = getDaysFromYear(format(CalendarStore.date, 'yyyy'));
		if (days)
			setDays(days.map((daysStack) => getEventsFromDays({ dates: daysStack, events: CalendarStore.events })));
	}, [CalendarStore.date, CalendarStore.events]);

	return (
		<div className={cn(css.year, className)} {...props}>
			{CalendarStore.loading && (
				<div className={css.year__loading}>
					<Loader size="xl" variant="bars" color={TailwindColors.primary.main} />
				</div>
			)}

			{!!days?.length &&
				days.map((month) => {
					if (!month.length) return;
					const monthName = format(month[0].date, 'LLLL', { locale: ru });
					const offset = Number(format(month[0].date, 'i'));

					return (
						<div key={format(month[0].date, 'yyyyMMdd')} className={css.month}>
							<TextField className={css.month__name}>{monthName}</TextField>

							<div className={css.month__wrapper}>
								<TextField size="small" className={css.dayName}>
									пн
								</TextField>
								<TextField size="small" className={css.dayName}>
									вт
								</TextField>
								<TextField size="small" className={css.dayName}>
									ср
								</TextField>
								<TextField size="small" className={css.dayName}>
									чт
								</TextField>
								<TextField size="small" className={css.dayName}>
									пт
								</TextField>
								<TextField size="small" className={css.dayName}>
									сб
								</TextField>
								<TextField size="small" className={css.dayName}>
									вс
								</TextField>

								{!!offset && [...Array(offset - 1)].map((empty, index) => <div key={index}></div>)}
								{month.map((day) => {
									const key = format(day.date, 'yyyyMMdd');
									const dayName = format(day.date, 'd');
									const dayOfWeekNumber = Number(format(day.date, 'i'));
									const isActiveDay = isSameDay(day.date, new Date());
									const isWeekend = dayOfWeekNumber === 7;
									const isShortDay = dayOfWeekNumber === 6;
									const isTransfer = day.transfer;
									const isHoliday = day.holiday;
									const isHolidayStart =
										day.holiday && format(day.holiday.dateStart, 'yyyyMMdd') === key;
									const isHolidayEnd = day.holiday && format(day.holiday.dateEnd, 'yyyyMMdd') === key;
									const hasEvent = !!day.events?.length;
									const hasVacation =
										hasEvent && day.events?.filter((event) => event.type === 'vacation');

									return (
										<>
											{!isHoliday && !hasEvent && (
												<TextField
													key={key}
													size="small"
													className={cn(css.day, {
														[css.day__active]: isActiveDay,
														[css.day__weekend]: isWeekend && !isTransfer,
														[css.day__shortDay]: isShortDay && !isTransfer,
													})}
												>
													{dayName}
												</TextField>
											)}

											{!isHoliday && hasEvent && (
												<TextField
													size="small"
													className={cn(css.day, {
														[css.day__weekend]: isWeekend && !isTransfer,
														[css.day__shortDay]: isShortDay && !isTransfer,
													})}
													key={key}
												>
													{!hasVacation && dayName}
													{!!hasVacation && (
														<Tooltip label={hasVacation[0].title}>
															<div
																onClick={hasVacation[0]?.onClick}
																style={{
																	cursor: hasVacation[0]?.onClick
																		? 'pointer'
																		: undefined,
																}}
															>
																{hasVacation[0].icon}
															</div>
														</Tooltip>
													)}
												</TextField>
											)}

											{isHoliday && (
												<Tooltip.Floating multiline label={day.holiday?.title} key={key}>
													<div
														onClick={day.holiday?.onClick}
														style={{ cursor: day.holiday?.onClick ? 'pointer' : undefined }}
														className={cn(css.day, {
															[css.day__holiday]: isHoliday,
															[css.day__holidayStart]: isHolidayStart,
															[css.day__holidayEnd]: isHolidayEnd,
														})}
													>
														<HolidaySvg className={css.day__icon} />
													</div>
												</Tooltip.Floating>
											)}
										</>
									);
								})}
							</div>
						</div>
					);
				})}
		</div>
	);
});
