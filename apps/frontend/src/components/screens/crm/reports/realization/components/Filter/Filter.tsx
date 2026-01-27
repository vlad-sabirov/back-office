import { FC, useContext, useEffect, useState } from 'react';
import {
	addMonths,
	addQuarters,
	addYears,
	eachMonthOfInterval,
	eachYearOfInterval,
	format,
	isSameYear,
	startOfQuarter,
	subQuarters,
	subYears,
} from 'date-fns';
import { isSameMonth, parse, subMonths } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { customLocaleRu } from '@config/date-fns.locale';
import { Button, DateMonthPicker, Icon, Select } from '@fsd/shared/ui-kit';
import { Popover } from '@mantine/core';
import { ReportRealizationContext } from '@screens/crm/reports/realization';
import { FilterPeriodType } from '../../cfg';
import css from './filter.module.scss';

export const Filter: FC = observer(() => {
	const { realizationStore, realizationMonthStore } = useContext(ReportRealizationContext);
	const { realizationQuarterStore, realizationYearStore } = useContext(ReportRealizationContext);
	const [years, setYears] = useState<Date[]>([]);
	const [quarter, setQuarter] = useState<Date[]>([]);
	const [isLoading] = useState<boolean>(false);

	const handleMonthPrev = () => {
		realizationMonthStore.setDate(subMonths(realizationMonthStore.date, 1));
	};

	const handleMonthNext = () => {
		realizationMonthStore.setDate(addMonths(realizationMonthStore.date, 1));
	};

	const handleMonthReset = () => {
		realizationMonthStore.setDate(realizationStore.maxRealizationDate || new Date());
	};

	const handleQuarterPrev = () => {
		realizationQuarterStore.setDate(subQuarters(realizationQuarterStore.date, 1));
	};

	const handleQuarterNext = () => {
		realizationQuarterStore.setDate(addQuarters(realizationQuarterStore.date, 1));
	};

	const handleQuarterReset = () => {
		realizationQuarterStore.setDate(realizationStore.maxRealizationDate || new Date());
	};

	const handleYearPrev = () => {
		realizationYearStore.setDate(subYears(realizationYearStore.date, 1));
	};

	const handleYearNext = () => {
		realizationYearStore.setDate(addYears(realizationYearStore.date, 1));
	};

	const handleYearReset = () => {
		realizationYearStore.setDate(realizationStore.maxRealizationDate || new Date());
	};

	const handleFilterReset = () => {
		if (realizationStore.sortType === FilterPeriodType.Month) handleMonthReset();
		if (realizationStore.sortType === FilterPeriodType.Quarter) handleQuarterReset();
		if (realizationStore.sortType === FilterPeriodType.Year) handleYearReset();
	};

	useEffect(() => {
		if (
			realizationStore.minPlanDate &&
			realizationStore.maxPlanDate &&
			realizationStore.minPlanDate.getTime() < realizationStore.maxPlanDate.getTime()
		) {
			setYears(
				eachYearOfInterval({ start: realizationStore.minPlanDate, end: realizationStore.maxPlanDate }).reverse()
			);
			setQuarter(
				eachMonthOfInterval({
					start: realizationStore.minPlanDate,
					end: realizationStore.maxPlanDate,
				}).reverse()
			);
		}
	}, [realizationStore.minPlanDate, realizationStore.maxPlanDate]);

	return (
		<Popover shadow="xl" position="right-start" offset={-8} radius={12} withArrow arrowOffset={12}>
			<Popover.Target>
				<div>
					<Button>
						<Icon name={'filter'} />
					</Button>
				</div>
			</Popover.Target>

			<Popover.Dropdown>
				<div className={css.wrapper}>
					<Select
						label={'Отчетный период'}
						data={[
							{ value: FilterPeriodType.Month, label: 'Месяц' },
							{ value: FilterPeriodType.Quarter, label: 'Квартал' },
							{ value: FilterPeriodType.Year, label: 'Год' },
						]}
						value={realizationStore.sortType}
						onChange={(value) => realizationStore.setSortType(value as FilterPeriodType)}
						disabled={isLoading}
					/>

					{realizationStore.sortType === FilterPeriodType.Month && (
						<div className={css.filterDate}>
							<DateMonthPicker
								label={'Месяц'}
								value={{
									year: format(realizationMonthStore.date, 'yyyy'),
									month: format(realizationMonthStore.date, 'M'),
								}}
								onChange={(val) => {
									if (!val) {
										return;
									}
									realizationMonthStore.setDate(
										parse(`${val.year}-${val.month}`, 'yyyy-MM', new Date())
									);
								}}
								disabled={isLoading}
								minDate={realizationStore.minRealizationDate || new Date()}
								maxDate={realizationStore.maxRealizationDate || new Date()}
							/>

							<Icon
								name={'arrow-medium'}
								className={css.filterDate__prev}
								onClick={handleMonthPrev}
								disabled={isSameMonth(
									realizationStore.minRealizationDate || new Date(),
									realizationMonthStore.date
								)}
							/>

							<Icon
								name={'arrow-medium'}
								className={css.filterDate__next}
								onClick={handleMonthNext}
								disabled={isSameMonth(
									realizationStore.maxRealizationDate || new Date(),
									realizationMonthStore.date
								)}
							/>
						</div>
					)}

					{realizationStore.sortType === FilterPeriodType.Quarter && (
						<div className={css.filterDate}>
							<Select
								label={'Квартал'}
								data={quarter.map((year) => ({
									value: format(year, 'yyyy-MM'),
									label: format(year, 'yyyy год, qqqq', { locale: customLocaleRu }),
								}))}
								value={format(startOfQuarter(realizationQuarterStore.date), 'yyyy-MM')}
								onChange={(value) => {
									if (value) realizationQuarterStore.setDate(parse(value, 'yyyy-MM', new Date()));
								}}
							/>

							<Icon
								name={'arrow-medium'}
								className={css.filterDate__prev}
								onClick={handleQuarterPrev}
								disabled={isSameMonth(
									startOfQuarter(realizationStore.minRealizationDate || new Date()),
									startOfQuarter(realizationQuarterStore.date)
								)}
							/>

							<Icon
								name={'arrow-medium'}
								className={css.filterDate__next}
								onClick={handleQuarterNext}
								disabled={isSameMonth(
									startOfQuarter(realizationStore.maxRealizationDate || new Date()),
									startOfQuarter(realizationQuarterStore.date)
								)}
							/>
						</div>
					)}

					{realizationStore.sortType === FilterPeriodType.Year && (
						<div className={css.filterDate}>
							<Select
								label={'Год'}
								data={years.map((year) => ({
									value: format(year, 'yyyy'),
									label: format(year, 'yyyy'),
								}))}
								value={format(realizationYearStore.date, 'yyyy')}
								onChange={(value) => {
									realizationYearStore.setDate(new Date(Number(value), 0, 1));
								}}
							/>

							<Icon
								name={'arrow-medium'}
								className={css.filterDate__prev}
								onClick={handleYearPrev}
								disabled={isSameYear(
									realizationStore.minRealizationDate || new Date(),
									realizationYearStore.date
								)}
							/>

							<Icon
								name={'arrow-medium'}
								className={css.filterDate__next}
								onClick={handleYearNext}
								disabled={isSameYear(
									realizationStore.maxRealizationDate || new Date(),
									realizationYearStore.date
								)}
							/>
						</div>
					)}

					<div className={css.button}>
						<Button
							onClick={handleFilterReset}
							iconLeft={<Icon name={'filter-clean'} />}
							size={'small'}
							disabled={isLoading}
						>
							Очистить фильтр
						</Button>
					</div>
				</div>
			</Popover.Dropdown>
		</Popover>
	);
});
