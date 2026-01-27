import { format } from 'date-fns';
import { TooltipProps } from 'recharts';
import { NameType } from 'recharts/types/component/DefaultTooltipContent';
import { ValueType } from 'tailwindcss/types/config';
import { TextField } from '@fsd/shared/ui-kit';
import css from './year.module.scss';

export const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
	if (active && payload && payload.length) {
		const { date, realization, plan, percent } = payload[0].payload;
		const dateFormatted = format(date, 'yyyy');
		const planFormatted = Intl.NumberFormat('ru-RU').format(Math.round(plan));
		const realizationFormatted = Intl.NumberFormat('ru-RU').format(Math.round(realization));

		return (
			<div className={css.tooltip}>
				<TextField size={'small'} className={css.tooltip__date}>
					{dateFormatted}
				</TextField>

				<TextField size={'small'} className={css.tooltip__plan}>
					- План: <span>{planFormatted}</span>
				</TextField>

				<TextField size={'small'} className={css.tooltip__realization}>
					- Реализация: <span>{realizationFormatted}</span>
				</TextField>

				<TextField size={'small'} className={css.tooltip__percent}>
					- Процент выполнения: <span>{percent}%</span>
				</TextField>
			</div>
		);
	}

	return null;
};
