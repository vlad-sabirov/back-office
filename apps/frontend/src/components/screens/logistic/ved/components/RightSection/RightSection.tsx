import { FC, useContext } from 'react';
import { Button, Icon, Menu } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { useAccess } from '@hooks';
import { Tooltip } from '@mantine/core';
import { Access } from '../../cfg';
import css from './styles.module.scss';

export const RightSection: FC = () => {
	const { modalStore } = useContext(MainContext);
	const CheckAccess = useAccess();

	return (
		<div className={css.wrapper}>
			{CheckAccess(Access.addOrder) && (
				<Tooltip
					label={'Добавить заявку'}
					multiline
					withArrow
					openDelay={1000}
					transitionDuration={300}
					position="top-end"
				>
					<div>
						<Button
							color="info"
							variant="easy"
							iconLeft={<Icon name="plus-medium" style={{ width: 12 }} />}
							onClick={() => modalStore.modalOpen('logisticVedOrderAdd', true)}
						>
							Заявка
						</Button>
					</div>
				</Tooltip>
			)}

			{CheckAccess(Access.accessRolesSettings) && (
				<Menu
					control={
						<Tooltip
							label={'Настройки заявок ВЭД'}
							multiline
							withArrow
							openDelay={1000}
							transitionDuration={300}
							position="top-end"
						>
							<div>
								<Button color="primary" variant="easy" iconLeft={<Icon name="settings" />}>
									Настройки
								</Button>
							</div>
						</Tooltip>
					}
				>
					<Menu.Item
						icon={<Icon name="stepper" />}
						onClick={() => modalStore.modalOpen('logisticStagesVedList', true)}
					>
						Стадии
					</Menu.Item>
				</Menu>
			)}
		</div>
	);
};
