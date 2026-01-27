import { useMemo } from 'react';
import { addMonths, format, parse, subMonths } from 'date-fns';
import { useCrmRealizationActions } from '@fsd/entities/crm-realization';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, DateMonthPicker, Icon } from '@fsd/shared/ui-kit';
import { Tooltip } from '@mantine/core';
import { DATE } from '../../../../config/date';
import css from '../../filter.module.scss';

export const Month = () => {
	const year = useStateSelector((state) => state.crm_realization.currentYear);
	const month = useStateSelector((state) => state.crm_realization.currentMonth);
	const currentDate = useMemo(() => parse(`${year}-${month}`, 'yyyy-MM', new Date()), [month, year]);
	const isPrevDisabled = useMemo(() => DATE.MIN >= currentDate, [currentDate]);
	const isNextDisabled = useMemo(() => DATE.MAX <= currentDate, [currentDate]);

	const realizationActions = useCrmRealizationActions();

	const handleChangeDate = (date: { year: string; month: string } | null) => {
		if (!date) return;
		realizationActions.setCurrentYear(date.year);
		realizationActions.setCurrentMonth(date.month);
	};

	const handlePrevMonth = () => {
		const newYear = format(subMonths(currentDate, 1), 'yyyy');
		const newMonth = format(subMonths(currentDate, 1), 'MM');
		handleChangeDate({ year: newYear, month: newMonth });
	};

	const handleNextMonth = () => {
		const newYear = format(addMonths(currentDate, 1), 'yyyy');
		const newMonth = format(addMonths(currentDate, 1), 'MM');
		handleChangeDate({ year: newYear, month: newMonth });
	};

	return (
		<div className={css.root__month}>
			<DateMonthPicker
				label={'Месяц'}
				value={{ year, month }}
				minDate={DATE.MIN}
				maxDate={DATE.MAX}
				onChange={handleChangeDate}
			/>

			<div className={css.buttons}>
				<Tooltip
					label={'Предыдущий месяц'}
					position={'left'}
					openDelay={300}
					withArrow
					disabled={isPrevDisabled}
				>
					<Button
						iconLeft={<Icon name={'arrow-small'} className={css.arrow__left} />}
						onClick={handlePrevMonth}
						disabled={isPrevDisabled}
					>
						Назад
					</Button>
				</Tooltip>

				<Tooltip
					label={'Следующий месяц'}
					position={'right'}
					openDelay={300}
					withArrow
					disabled={isNextDisabled}
				>
					<Button
						iconRight={<Icon name={'arrow-small'} className={css.arrow__right} />}
						onClick={handleNextMonth}
						disabled={isNextDisabled}
					>
						Вперед
					</Button>
				</Tooltip>
			</div>
		</div>
	);
};
