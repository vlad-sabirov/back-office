import { FC } from 'react';
import { TextField } from '@fsd/shared/ui-kit';
import { NumberFormat } from '@helpers/NumberFormat';
import css from '../styles.module.scss';
import { PartProps } from './props';

export const CustomerShipmentModalPart: FC<PartProps> = ({ current, old }) => {
	const shipmentDiff =
		current?.customerShipment && old?.customerShipment ? current?.customerShipment - old?.customerShipment : null;

	const shipmentSup = shipmentDiff ? NumberFormat(shipmentDiff, { operator: true, sup: true }) : null;

	return current?.customerShipment ? (
		<TextField className={css.modal__customerShipment}>
			Организаций отгрузилось:{' '}
			<span>
				{current?.customerShipment}
				{shipmentSup}
			</span>
		</TextField>
	) : null;
};
