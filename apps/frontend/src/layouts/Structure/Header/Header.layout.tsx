import { useContext } from 'react';
import cn from 'classnames';
import { observer } from 'mobx-react-lite';
import { VoipHeaderPopup } from '@fsd/entities/voip';
import { SearchHeader } from '@fsd/features/search-header';
import { TodoTaskModalInfo } from '@fsd/features/todo-modal-task-info';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Avatar, Icon, Menu, NextLink } from '@fsd/shared/ui-kit';
import { TodoHeaderWidget } from '@fsd/widgets/todo-header';
import { MainContext } from '@globalStore';
import { CheckAccessJSX } from '@helpers/CheckAccess';
import { useLogout } from '@layouts/lib/use-logout';
import UserRole from '@screens/user-role/UserRole';
import { HeaderLayoutProps } from './Header.props';
import css from './Header.module.scss';

export const HeaderLayout = observer(({ className, ...props }: HeaderLayoutProps): JSX.Element => {
	const { modalStore } = useContext(MainContext);
	const user = useStateSelector((state) => state.app.auth);
	const logout = useLogout();

	return (
		<div className={cn(css.wrapper, className)} {...props}>
			<SearchHeader className={css.search} />

			<div className={css.services}>
				{user.userId === 1 && (
					<>
						<TodoHeaderWidget />
						<TodoTaskModalInfo />
					</>
				)}
				<VoipHeaderPopup />
			</div>

			<div className={css.settings}>
				<Menu
					control={
						<span>
							<Avatar
								className={css.settingsAvatar}
								src={user?.photo}
								text={
									user.firstName && user.lastName ? user.lastName[0] + user.firstName[0] : undefined
								}
								color={user?.color ?? undefined}
							/>
						</span>
					}
					width={200}
				>
					<Menu.Label>
						{user?.lastName} {user?.firstName}
					</Menu.Label>

					<Menu.Item
						component={NextLink}
						href={`/staff/list/cabinet/` + user?.userId}
						icon={<Icon name="user" />}
						className={cn(css.modalItem)}
					>
						Профиль
					</Menu.Item>

					<CheckAccessJSX
						accessRoles={['admin', 'developer']}
						content={
							<Menu.Item
								icon={<Icon name="users" />}
								onClick={() => modalStore.modalOpen('userRoleList', true)}
							>
								Роли
							</Menu.Item>
						}
					/>

					<CheckAccessJSX
						accessRoles={['admin', 'developer']}
						content={
							<Menu.Item component={NextLink} href={`/ui`} icon={<Icon name="slider" />} color="blue">
								UI Builder
							</Menu.Item>
						}
					/>

					<Menu.Divider />

					<Menu.Item
						component={NextLink}
						color="red"
						icon={<Icon name="logout" />}
						className={cn(css.modalItem, css.modalItem__red)}
						onClick={() => logout()}
					>
						Выйти из аккаунта
					</Menu.Item>
				</Menu>
			</div>
			<UserRole />
		</div>
	);
});
