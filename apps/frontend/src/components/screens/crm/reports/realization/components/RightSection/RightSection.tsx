import { FC, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Icon } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { useAccess } from '@hooks';
import { Tooltip } from '@mantine/core';
import { RealizationAccess } from '../..';
import { IRightSelectionProps } from '.';
import css from './styles.module.scss';

export const RightSection: FC<IRightSelectionProps> = observer((props) => {
	const { modalStore } = useContext(MainContext);
	const CheckAccess = useAccess();

	return (
		<div className={css.wrapper} {...props}>
			{CheckAccess(RealizationAccess.addRealization) && (
				<Tooltip
					label={'Добавить отчет реализации'}
					multiline
					withArrow
					openDelay={1000}
					transitionDuration={300}
					position="top-end"
				>
					<div>
						<Button
							color="info"
							size="medium"
							variant="easy"
							iconLeft={<Icon name="plus-large" />}
							onClick={() => modalStore.modalOpen('crmReportRealizationAdd', true)}
						>
							Отчет реализации
						</Button>
					</div>
				</Tooltip>
			)}

			{CheckAccess(RealizationAccess.planEditing) && (
				<Tooltip
					label={'Выставление и корректировка планов'}
					multiline
					withArrow
					openDelay={1000}
					transitionDuration={300}
					position="top-end"
				>
					<div>
						<Button
							color="primary"
							size="medium"
							variant="easy"
							iconLeft={<Icon name="analytics" />}
							onClick={() => modalStore.modalOpen('crmReportRealizationPlanList', true)}
						>
							Планы
						</Button>
					</div>
				</Tooltip>
			)}
		</div>
	);
});
