import { FC } from 'react';
import { TextField } from '@fsd/shared/ui-kit';
import { NumberFormat } from '@helpers/NumberFormat';
import css from '../styles.module.scss';
import { PartProps } from './props';

export const CheckModalPart: FC<PartProps> = ({ current, old }) => {
	const check =
		current?.realization && current?.shipmentCount
			? Math.round(current?.realization / current?.shipmentCount)
			: null;
	const checkOld = old?.realization && old?.shipmentCount ? Math.round(old?.realization / old?.shipmentCount) : null;

	const checkSup = check && checkOld ? check - checkOld : null;
	const checkSupDisplay = checkSup ? NumberFormat(checkSup, { operator: true, sup: true }) : '';

	return current?.customerCount ? (
		<TextField className={css.modal__check}>
			Средний чек:{' '}
			<span>
				{NumberFormat(check)}
				{checkSupDisplay}
			</span>
		</TextField>
	) : null;
};
