import { FC } from 'react';
import { TextField } from '@fsd/shared/ui-kit';
import { NumberFormat } from '@helpers/NumberFormat';
import css from '../styles.module.scss';
import { PartProps } from './props';

export const ShipmentCountModalPart: FC<PartProps> = ({ current, old }) => {
	const shipmentDiff =
		current?.shipmentCount && old?.shipmentCount ? current?.shipmentCount - old?.shipmentCount : null;
	const shipmentSup = shipmentDiff ? NumberFormat(shipmentDiff, { operator: true, sup: true }) : null;

	return current?.shipmentCount ? (
		<TextField className={css.modal__shipmentCount}>
			Всего отгрузок:{' '}
			<span>
				{current?.shipmentCount}
				{shipmentSup}
			</span>
		</TextField>
	) : null;
};
