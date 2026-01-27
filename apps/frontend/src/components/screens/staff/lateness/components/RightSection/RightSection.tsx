import { FC, useContext } from 'react';
import cn from 'classnames';
import { addDays, setHours, subDays } from 'date-fns';
import { isSameDay } from 'date-fns/fp';
import { observer } from 'mobx-react-lite';
import { DatePicker, Icon } from '@fsd/shared/ui-kit';
import { Tooltip } from '@mantine/core';
import { LatenessContext } from '@screens/staff/lateness';
import { RightSectionProps } from '.';
import css from './right-section.module.scss';

const minDate = new Date(2022, 7, 15);
const todayDate = new Date();

export const RightSection: FC<RightSectionProps> = observer(({ className, ...props }) => {
	const latenessStore = useContext(LatenessContext);

	const handleChangeDate = (value: Date) => {
		latenessStore.setDateSingle(setHours(value, 12));
	};

	const handleChangeDatePrev = () => {
		latenessStore.setDateSingle(subDays(latenessStore.dateSingle, 1));
	};

	const handleChangeDateNext = () => {
		latenessStore.setDateSingle(addDays(latenessStore.dateSingle, 1));
	};

	const handleChangeDateRestore = () => {
		latenessStore.setDateSingle(todayDate);
	};

	return (
		<div className={cn(css.root, className)} {...props}>
			<div className={css.date}>
				<Tooltip
					label="Предыдущий день"
					transitionDuration={300}
					openDelay={500}
					disabled={isSameDay(latenessStore.dateSingle, minDate)}
				>
					<div>
						<Icon
							name={'arrow-small'}
							className={css.date__arrowPrev}
							onClick={handleChangeDatePrev}
							disabled={isSameDay(latenessStore.dateSingle, minDate)}
						/>
					</div>
				</Tooltip>

				<Tooltip
					label="Сбросить"
					transitionDuration={300}
					openDelay={500}
					disabled={isSameDay(todayDate, latenessStore.dateSingle)}
				>
					<div>
						<Icon
							name="history"
							className={css.date__restore}
							onClick={handleChangeDateRestore}
							disabled={isSameDay(todayDate, latenessStore.dateSingle)}
						/>
					</div>
				</Tooltip>

				<DatePicker
					variant={'darkGray'}
					clearable={false}
					value={latenessStore.dateSingle}
					onChange={handleChangeDate}
					className={css.date__picker}
					maxDate={todayDate}
					minDate={minDate}
				/>

				<Tooltip
					label={'Следующий день'}
					transitionDuration={300}
					openDelay={500}
					disabled={isSameDay(todayDate, latenessStore.dateSingle)}
				>
					<div>
						<Icon
							name={'arrow-small'}
							className={css.date__arrowNext}
							onClick={handleChangeDateNext}
							disabled={isSameDay(todayDate, latenessStore.dateSingle)}
						/>
					</div>
				</Tooltip>
			</div>
		</div>
	);
});
