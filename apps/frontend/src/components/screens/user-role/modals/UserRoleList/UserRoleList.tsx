import { FC, useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { AvatarGroup, Button, Icon, Menu, Modal, TextField } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { CheckAccessBoolean } from '@helpers/CheckAccess';
import { useRoles } from '@hooks';
import { UserRoleContext } from '../../UserRole';
import { IUserRoleListProps } from './props';
import css from './styles.module.scss';

export const UserRoleList: FC<IUserRoleListProps> = observer(() => {
	const { modalStore } = useContext(MainContext);
	const { userRoleStore } = useContext(UserRoleContext);
	const roles = useRoles();

	useEffect(() => {
		userRoleStore.getRoleList();
	}, [userRoleStore]);

	return (
		<Modal
			title="Роли пользователей"
			opened={modalStore.modals.userRoleList}
			onClose={() => modalStore.modalOpen('userRoleList', false)}
			size={480}
		>
			<Head>
				<title>Роли пользователей. Back Office</title>
			</Head>

			<div className={css.wrapper}>
				{userRoleStore.roleList &&
					userRoleStore.roleList.map((role) => {
						return (
							<div key={'roleId' + role.id}>
								{(role.alias !== 'admin' || CheckAccessBoolean([], roles)) && (
									<div className={css.item}>
										<TextField className={css.alias}>{role.alias}</TextField>

										<AvatarGroup
											limit={3}
											size="extraSmall"
											borderColor="white"
											className={css.avatars}
											data={
												role.users
													? role.users.map((user) => ({
															color: user.color,
															text: `${user.firstName[0]} ${user.lastName[0]}`,
															src: user.photo,
														}))
													: []
											}
										/>

										{((role.alias !== 'boss' && role.alias !== 'developer') ||
											CheckAccessBoolean([], roles)) && (
											<Menu
												key={role.id}
												control={
													<span>
														<Icon name="dots-three" className={css.menu} />
													</span>
												}
											>
												{CheckAccessBoolean([], roles) && (
													<Menu.Item
														icon={<Icon name="edit" />}
														color="blue"
														onClick={() => {
															modalStore.modalOpen('userRoleEdit', true);
															userRoleStore.setRoleCurrent(role);
														}}
													>
														Изменить
													</Menu.Item>
												)}

												<Menu.Item
													icon={<Icon name="users" />}
													onClick={() => {
														modalStore.modalOpen('userRoleStaff', true);
														userRoleStore.setRoleCurrent(role);
													}}
												>
													Сотрудники
												</Menu.Item>

												{CheckAccessBoolean([], roles) && (
													<Menu.Item
														color="red"
														icon={<Icon name="trash" />}
														onClick={() => {
															modalStore.modalOpen('userRoleDelete', true);
															userRoleStore.setRoleCurrent(role);
														}}
													>
														Удалить
													</Menu.Item>
												)}
											</Menu>
										)}

										<TextField className={css.description} size="small">
											{role.description}
										</TextField>
									</div>
								)}
							</div>
						);
					})}
			</div>

			<Modal.Buttons>
				<Button onClick={() => modalStore.modalOpen('userRoleList', false)}>Отмена</Button>
				{CheckAccessBoolean([], roles) && (
					<Button color="primary" variant="hard" onClick={() => modalStore.modalOpen('userRoleAdd', true)}>
						Добавить роль
					</Button>
				)}
			</Modal.Buttons>
		</Modal>
	);
});
