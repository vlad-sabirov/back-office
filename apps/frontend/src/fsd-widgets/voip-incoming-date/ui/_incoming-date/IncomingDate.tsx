import { FC, memo, useCallback, useMemo } from 'react';
import { IIncomingDateProps } from './incoming-date.types';
import cn from 'classnames';
import { addMonths, endOfMonth, format, isSameMonth } from 'date-fns';
import { parse, parseISO, startOfMonth, subMonths } from 'date-fns';
import { useVoipActions } from '@fsd/entities/voip';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { DateMonthPicker, DateMonthPickerPropsValue, Icon } from '@fsd/shared/ui-kit';
import css from './incoming-date.module.scss';

export const IncomingDate: FC<IIncomingDateProps> = memo((props) => {
	const { minDate, maxDate, className } = props;
	const date = useStateSelector((state) => state.voip.config.incoming.date);

	const { year, month } = useMemo<{ year: string; month: string }>(() => {
		return { year: format(parseISO(date.start), 'yyyy'), month: format(parseISO(date.start), 'MM') };
	}, [date]);
	const isDisableNext = useMemo<boolean>(() => {
		if (!maxDate) return false;
		return isSameMonth(parse(`${year}-${month}-07`, 'yyyy-MM-dd', new Date()), maxDate);
	}, [maxDate, month, year]);
	const isDisablePrev = useMemo<boolean>(() => {
		if (!minDate) return false;
		return isSameMonth(parse(`${year}-${month}-07`, 'yyyy-MM-dd', new Date()), minDate);
	}, [minDate, month, year]);

	const voipActions = useVoipActions();

	const handleChangeDate = useCallback(
		(val: DateMonthPickerPropsValue | null) => {
			if (!val) return;
			voipActions.setConfig({
				incoming: {
					date: {
						start:
							format(
								startOfMonth(parse(`${val.year}-${val.month}-07`, 'yyyy-MM-dd', new Date())),
								'yyyy-MM-dd'
							) + 'T00:00:00Z',
						end:
							format(
								endOfMonth(parse(`${val.year}-${val.month}-07`, 'yyyy-MM-dd', new Date())),
								'yyyy-MM-dd'
							) + 'T00:00:00Z',
					},
				},
			});
		},
		[voipActions]
	);

	const handlePrevDate = useCallback(() => {
		const prevDate = subMonths(parse(`${year}-${month}-07`, 'yyyy-MM-dd', new Date()), 1);
		voipActions.setConfig({
			incoming: {
				date: {
					start: format(startOfMonth(prevDate), 'yyyy-MM-dd') + 'T00:00:00Z',
					end: format(endOfMonth(prevDate), 'yyyy-MM-dd') + 'T00:00:00Z',
				},
			},
		});
	}, [month, voipActions, year]);

	const handleNextDate = useCallback(() => {
		const prevDate = addMonths(parse(`${year}-${month}-07`, 'yyyy-MM-dd', new Date()), 1);
		voipActions.setConfig({
			incoming: {
				date: {
					start: format(startOfMonth(prevDate), 'yyyy-MM-dd') + 'T00:00:00Z',
					end: format(endOfMonth(prevDate), 'yyyy-MM-dd') + 'T00:00:00Z',
				},
			},
		});
	}, [month, voipActions, year]);

	return (
		<div className={cn(css.root, className)}>
			<Icon name={'arrow-small'} className={css.arrowLeft} onClick={handlePrevDate} disabled={isDisablePrev} />

			<DateMonthPicker
				variant={'darkGray'}
				value={{ year, month }}
				onChange={handleChangeDate}
				minDate={minDate}
				maxDate={maxDate}
			/>

			<Icon name={'arrow-small'} className={css.arrowRight} onClick={handleNextDate} disabled={isDisableNext} />
		</div>
	);
});

IncomingDate.displayName = 'IncomingDate';
