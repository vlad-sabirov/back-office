import { FC } from 'react';
import { TextField } from '@fsd/shared/ui-kit';
import { NumberFormat } from '@helpers/NumberFormat';
import css from '../styles.module.scss';
import { PartProps } from './props';

export const DeepModalPart: FC<PartProps> = ({ current, old }) => {
	const deep =
		current?.shipmentCount && current?.customerShipment
			? Math.round((current?.shipmentCount / current?.customerShipment) * 10) / 10
			: null;

	const deepOld =
		old?.shipmentCount && old?.customerShipment
			? Math.round((old?.shipmentCount / old?.customerShipment) * 10) / 10
			: null;

	const deepSup = deep && deepOld ? Math.round((deep - deepOld) * 10) / 10 : null;
	const deepSupDisplay = deepSup ? NumberFormat(deepSup, { operator: true, sup: true }) : '';

	return current?.customerCount ? (
		<TextField className={css.modal__deep}>
			Сделок на организацию:{' '}
			<span>
				{NumberFormat(deep)}
				{deepSupDisplay}
			</span>
		</TextField>
	) : null;
};
