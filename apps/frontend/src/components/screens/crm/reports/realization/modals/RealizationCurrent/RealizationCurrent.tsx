import { FC, useState } from 'react';
import { CheckModalPart, CustomerCountModalPart, CustomerShipmentModalPart } from './parts';
import { DeepModalPart, PercentModalPart, PlanModalPart, RealizationModalPart, ShipmentCountModalPart } from './parts';
import { format, parse } from 'date-fns';
import { Button, Icon, Modal, TextField } from '@fsd/shared/ui-kit';
import { customLocaleRu } from '@config/date-fns.locale';
import { ReportRealizationResponse } from '@interfaces';
import { RealizationConfiguration } from '..';
import { RealizationCurrentProps } from './props';
import css from './styles.module.scss';

export const RealizationCurrent: FC<RealizationCurrentProps> = ({ ...props }) => {
	const [configurationModalOpen, setConfigurationModalOpen] = useState<boolean>(false);
	const [configurationCurrent, setConfigurationCurrent] = useState<ReportRealizationResponse | null>(null);
	const { current, open, setOpen } = props;
	const date: string = current
		? format(parse(`${current.year}-${current.month}`, 'yyyy-MM', new Date()), 'LLLL yyyy', {
				locale: customLocaleRu,
		})
		: '';

	return (
		<>
			<Modal title={`Отчет за ${date}`} opened={open} onClose={() => setOpen(false)} size={440}>
				{current?.user && (
					<TextField mode="heading" className={css.name}>
						{current.user.lastName} {current.user.firstName}
					</TextField>
				)}
				<RealizationModalPart {...props} />
				<PlanModalPart {...props} />
				<PercentModalPart {...props} />
				<CustomerCountModalPart {...props} />
				<CustomerShipmentModalPart {...props} />
				<ShipmentCountModalPart {...props} />
				<CheckModalPart {...props} />
				<DeepModalPart {...props} />

				<div className={css.buttonWrapper}>
					<Button
						color={'primary'}
						iconLeft={<Icon name={'settings'} />}
						onClick={() => {
							setConfigurationCurrent(current);
							setConfigurationModalOpen(true);
						}}
					>
						Что если?
					</Button>
				</div>
			</Modal>

			<RealizationConfiguration
				opened={configurationModalOpen}
				setOpened={setConfigurationModalOpen}
				current={configurationCurrent}
			/>
		</>
	);
};
