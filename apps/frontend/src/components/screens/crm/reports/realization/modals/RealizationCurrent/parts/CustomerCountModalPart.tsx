import { FC } from 'react';
import { TextField } from '@fsd/shared/ui-kit';
import { NumberFormat } from '@helpers/NumberFormat';
import css from '../styles.module.scss';
import { PartProps } from './props';

export const CustomerCountModalPart: FC<PartProps> = ({ current, old }) => {
	const countDiff = current?.customerCount && old?.customerCount ? current?.customerCount - old?.customerCount : null;

	const countSup = countDiff ? NumberFormat(countDiff, { operator: true, sup: true }) : null;

	return current?.customerCount ? (
		<TextField className={css.modal__customerCount}>
			Организаций в базе:{' '}
			<span>
				{current?.customerCount}
				{countSup}
			</span>
		</TextField>
	) : null;
};
