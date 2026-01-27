import { useMemo } from 'react';
import { isSameYear, parse } from 'date-fns';
import { useCrmRealizationActions } from '@fsd/entities/crm-realization';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon, TextField } from '@fsd/shared/ui-kit';
import { Tooltip } from '@mantine/core';
import { DATE } from '../../../../config/date';
import css from '../../filter.module.scss';

export const Year = () => {
	const year = useStateSelector((state) => state.crm_realization.currentYear);
	const currentDate = useMemo(() => parse(`${year}`, 'yyyy', new Date()), [year]);
	const isPrevDisabled = useMemo(() => isSameYear(currentDate, DATE.MIN), [currentDate]);
	const isNextDisabled = useMemo(() => isSameYear(currentDate, DATE.MAX), [currentDate]);

	const realizationActions = useCrmRealizationActions();

	const handleChangeDate = (date: { year: string } | null) => {
		if (!date) return;
		realizationActions.setCurrentYear(date.year);
	};

	const handlePrevYear = () => {
		handleChangeDate({ year: String(Number(year) - 1) });
	};

	const handleNextYear = () => {
		handleChangeDate({ year: String(Number(year) + 1) });
	};

	return (
		<div className={css.root__year}>
			<TextField className={css.year}>
				Показан <strong>{year}</strong> год
			</TextField>
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
						onClick={handlePrevYear}
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
						onClick={handleNextYear}
						disabled={isNextDisabled}
					>
						Вперед
					</Button>
				</Tooltip>
			</div>
		</div>
	);
};
