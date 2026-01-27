import { FC } from 'react';
import { TextField } from '@fsd/shared/ui-kit';
import { NumberFormat } from '@helpers/NumberFormat';
import css from '../styles.module.scss';
import { PartProps } from './props';

export const PercentModalPart: FC<PartProps> = ({ current, old }) => {
	const percentCurrent = current?.realization ? Math.round((current.realization / current.plan) * 100) : 0;
	const percentOld = old?.realization ? Math.round((old.realization / old.plan) * 100) : 0;
	const percentDiff = old?.realization ? percentCurrent - percentOld : null;
	const percentSup = percentDiff ? NumberFormat(percentDiff, { operator: true, sup: true, after: '%' }) : null;

	return current?.plan ? (
		<TextField className={css.modal__percent}>
			Процент выполнения плана:{' '}
			<span>
				{percentCurrent}%{percentSup}
			</span>
		</TextField>
	) : null;
};
