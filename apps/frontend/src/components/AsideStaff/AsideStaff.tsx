import { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Avatar, Icon, Input, Menu, TextField } from '@fsd/shared/ui-kit';
import { MenuItemStaffUser } from '@fsd/shared/ui-kit/menu/items/MenuUser';
import { MainContext } from '@globalStore';
import { IUserResponse } from '@interfaces/user/UserList.response';
import css from './Styles.module.scss';

export const AsideStaff = observer((): JSX.Element => {
	const { staffStore } = useContext(MainContext);
	const [staff, setStaff] = useState<IUserResponse[]>([]);
	const [filter, setFilter] = useState<string>('');
	const [filterTimerId, setFilterTimerId] = useState<NodeJS.Timeout>();

	useEffect(() => {
		if (!staffStore.userList.length) {
			staffStore.getUserList().then();
			return;
		}
		clearTimeout(filterTimerId);

		const newTimer = setTimeout(() => {
			setStaff(
				staffStore.userList.filter((user) =>
					(user.lastName + user.firstName).toLocaleLowerCase().includes(filter.toLocaleLowerCase())
				)
			);
		}, 250);
		setFilterTimerId(newTimer);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [staffStore.userList, filter, staffStore]);

	useEffect(() => {
		staffStore.getUserList().then();
	}, [staffStore]);

	if (staffStore.userList.length > 0) {
		return (
			<div className={css.root}>
				<Input
					variant="gray"
					placeholder="Имя сотрудника..."
					iconLeft={<Icon name="filter" />}
					value={filter}
					onChange={(event) => setFilter(event.currentTarget.value)}
					className={css.filter}
				/>
				{staff.map((user) => {
					return (
						<Menu
							key={`asideStaffUserId` + user.id}
							width={225}
							offset={-20}
							control={
								<div key={`asideNavigation${user.id}`} className={css.wrapper}>
									<Avatar
										src={user.photo}
										size="small"
										color={user.color}
										text={user.lastName[0] + user.firstName[0]}
										className={css.name}
									/>

									<TextField size="small" className={css.name}>
										{user.lastName} {user.firstName}
									</TextField>
								</div>
							}
						>
							<MenuItemStaffUser data={user} />
						</Menu>
					);
				})}
			</div>
		);
	}

	return <></>;
});
