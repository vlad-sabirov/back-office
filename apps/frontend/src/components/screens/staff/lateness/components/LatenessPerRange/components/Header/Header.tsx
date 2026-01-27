import { FC } from 'react';
import cn from 'classnames';
import { addDays, addMonths, format, isSameMonth, parse, subMonths } from 'date-fns';
import { customLocaleRu } from '@config/date-fns.locale';
import { Button, DateMonthPicker, Icon, TextField } from '@fsd/shared/ui-kit';
import { Tooltip } from '@mantine/core';
import { HeaderProps } from '.';
import css from './header.module.scss';

const SELF_DATE = new Date();
const MIN_DATE = new Date(2022, 7, 15);

export const Header: FC<HeaderProps> = ({ date, setDate, onRefresh, className, ...props }) => {
	const handleSetDateNext = () => {
		setDate(addMonths(date, 1));
	};

	const handleSetDatePrev = () => {
		setDate(subMonths(date, 1));
	};

	const handleSetDateReset = () => {
		setDate(SELF_DATE);
	};

	const handleRefresh = () => {
		onRefresh();
	};

	return (
		<div className={cn(css.wrapper, className)} {...props}>
			<TextField mode={'heading'} className={css.title}>
				Отчет за {format(date, 'LLLL yyyy', { locale: customLocaleRu })}
			</TextField>

			<Tooltip label={'Обновить данные месячного отчета'} openDelay={500} withArrow>
				<div>
					<Button className={css.refreshButton}>
						<Icon name={'refresh'} onClick={handleRefresh} />
					</Button>
				</div>
			</Tooltip>

			<div></div>

			<div className={css.date}>
				<Tooltip label={'Предыдущий месяц'} openDelay={400} disabled={isSameMonth(date, MIN_DATE)}>
					<div>
						<Icon
							name={'arrow-small'}
							className={css.date__iconPrev}
							disabled={isSameMonth(date, MIN_DATE)}
							onClick={handleSetDatePrev}
						/>
					</div>
				</Tooltip>

				<Tooltip label={'Сбросить'} openDelay={400} disabled={isSameMonth(date, SELF_DATE)}>
					<div>
						<Icon name={'history'} disabled={isSameMonth(date, SELF_DATE)} onClick={handleSetDateReset} />
					</div>
				</Tooltip>

				<DateMonthPicker
					variant={'darkGray'}
					value={{ year: format(date, 'yyyy'), month: format(date, 'MM') }}
					onChange={(value) => {
						if (!value) return;
						setDate(addDays(parse(`${value.year}-${value.month}`, 'yyyy-MM', new Date()), 1));
					}}
					className={css.date__picker}
					minDate={MIN_DATE}
					maxDate={SELF_DATE}
				/>

				<Tooltip label={'Следующий месяц'} openDelay={400} disabled={isSameMonth(date, SELF_DATE)}>
					<div>
						<Icon
							name={'arrow-small'}
							className={css.date__iconNext}
							disabled={isSameMonth(date, SELF_DATE)}
							onClick={handleSetDateNext}
						/>
					</div>
				</Tooltip>
			</div>
		</div>
	);
};
