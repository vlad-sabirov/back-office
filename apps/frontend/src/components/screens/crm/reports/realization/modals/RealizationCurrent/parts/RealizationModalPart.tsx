import { FC } from 'react';
import { TextField } from '@fsd/shared/ui-kit';
import { NumberFormat } from '@helpers/NumberFormat';
import css from '../styles.module.scss';
import { PartProps } from './props';

export const RealizationModalPart: FC<PartProps> = ({ current, old }) => {
	const realization = current?.realization ? `${NumberFormat(current?.realization)}` : null;
	const realizationSup = current?.realization && old?.realization ? current?.realization - old?.realization : null;
	const realizationSupDisplay = realizationSup ? NumberFormat(realizationSup, { operator: true, sup: true }) : '';

	return current?.realization ? (
		<TextField className={css.modal__realization}>
			Реализация:{' '}
			<span>
				{realization}
				{realizationSupDisplay}
			</span>
		</TextField>
	) : null;
};
