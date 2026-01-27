import { FC } from 'react';
import { TextField } from '@fsd/shared/ui-kit';
import { NumberFormat } from '@helpers/NumberFormat';
import css from '../styles.module.scss';
import { PartProps } from './props';

export const PlanModalPart: FC<PartProps> = ({ current, old }) => {
	const plan = current?.plan ? `${NumberFormat(current?.plan)}` : null;
	const planSup = current && old?.plan ? current?.plan - old?.plan : null;
	const planSupDisplay = planSup ? NumberFormat(planSup, { operator: true, sup: true }) : '';

	return current?.plan ? (
		<TextField className={css.modal__plan}>
			План:{' '}
			<span>
				{plan}
				{planSupDisplay}
			</span>
		</TextField>
	) : null;
};
