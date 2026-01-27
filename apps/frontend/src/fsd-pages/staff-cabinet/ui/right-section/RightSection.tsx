import { FC, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon, Menu } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { useAccess } from '@hooks';
import { Tooltip } from '@mantine/core';
import { Access } from '@screens/staff/cfg';

export const RightSection: FC = observer(({ ...props }) => {
	const CheckAccess = useAccess();
	const { query } = useRouter();
	const { modalStore, staffStore } = useContext(MainContext);
	const userId = useStateSelector((state) => state.app.auth.userId);

	return (
		<div style={{ display: 'grid', gridAutoFlow: 'column', gap: 20 }} {...props}>
			{CheckAccess(Access.userHire) && staffStore.userCurrent.isFired && (
				<Tooltip
					label={'Принять на работу снова'}
					withArrow
					openDelay={1000}
					transitionDuration={300}
					position="top-end"
				>
					<div>
						<Button
							color="success"
							variant="easy"
							iconLeft={<Icon name="user" />}
							onClick={() => modalStore.modalOpen('staffUserHire')}
						>
							Принять на работу
						</Button>
					</div>
				</Tooltip>
			)}

			{(Number(userId ?? 0) === Number(query.id) || CheckAccess(Access.userEdit)) && (
				<Menu
					width={250}
					control={
						<Tooltip
							label={'Изменить пароль, личные данные'}
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
					{Number(userId ?? 0) === Number(query.id) && !CheckAccess(Access.userEdit) && (
						<>
							<Menu.Item
								icon={<Icon name="user" />}
								onClick={() => modalStore.modalOpen('staffCardPersonalInfoEdit', true)}
							>
								Персональная информация
							</Menu.Item>

							<Menu.Item
								icon={<Icon name="phone" />}
								onClick={() => modalStore.modalOpen('staffCardContactInfoEdit', true)}
							>
								Контактная информация
							</Menu.Item>

							<Menu.Divider />
						</>
					)}

					{CheckAccess(Access.userEdit) && (
						<Menu.Item
							icon={<Icon name="edit" />}
							onClick={() => modalStore.modalOpen('staffUserEdit', true)}
						>
							Информация
						</Menu.Item>
					)}

					<Menu.Item
						icon={<Icon name="password" />}
						onClick={() => modalStore.modalOpen('staffUserChangePassword', true)}
					>
						Пароль
					</Menu.Item>

					{CheckAccess(Access.userFire) && !staffStore.userCurrent.isFired && (
						<>
							<Menu.Divider />

							<Menu.Item
								color="orange"
								icon={<Icon name="fired" />}
								onClick={() => modalStore.modalOpen('staffUserFired', true)}
							>
								Уволить
							</Menu.Item>
						</>
					)}
					{CheckAccess([]) ? (
						<Menu.Item
							color="red"
							icon={<Icon name="trash" />}
							onClick={() => modalStore.modalOpen('staffUserDelete', true)}
						>
							Удалить
						</Menu.Item>
					) : null}
				</Menu>
			)}
		</div>
	);
});
