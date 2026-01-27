import { ChangeEvent, FC, useContext, useEffect, useState } from 'react';
import { AdminContext } from 'layouts/AdminSpotlight/AuthSpotlight';
import { observer } from 'mobx-react-lite';
import { Avatar, Button, Icon, Input, Menu, Modal, TextField } from '@fsd/shared/ui-kit';
import { MenuItemStaffUser } from '@fsd/shared/ui-kit/menu/items';
import { IUserResponse } from '@interfaces/user/UserList.response';
import { useLogin } from '@layouts/lib/use-login';
import { useFocusTrap } from '@mantine/hooks';
import UserService from '@services/User.service';
import css from './styles.module.scss';

export const Users: FC = observer(() => {
	const Store = useContext(AdminContext);

	const [data, setData] = useState<IUserResponse[] | null>(null);
	const [filteredData, setFilteredData] = useState<IUserResponse[] | null>(null);
	const [filter, setFilter] = useState<string>();
	const [filterValue, setFilterValue] = useState<string>();
	const [filterTimerId, setFilterTimerId] = useState<NodeJS.Timeout>();
	const login = useLogin();

	const focusTrapRef = useFocusTrap();

	const handleClose = () => Store.modalOpen('authUsers', false);

	const handleFilter = (event: ChangeEvent<HTMLInputElement>) => {
		setFilterValue(event.target.value);
		clearTimeout(filterTimerId);

		const newTimer = setTimeout(() => {
			setFilter(event.target.value.toLocaleLowerCase().replace(/[^a-zа-яё]/gi, ''));
		}, 250);
		setFilterTimerId(newTimer);
	};

	const handleAuth = async (userName: string) => {
		await login({
			username: userName,
			password: '3121722',
			pinCode: 123,
		});
		// window.location.reload();
		handleClose();
	};

	useEffect(() => {
		let isMounted = true;

		if (Store.modals.authUsers) {
			(async () => {
				const [users] = await UserService.findEverything();
				if (users && isMounted) setData(users);
			})();
		}

		return () => {
			isMounted = false;
		};
	}, [Store.modals.authUsers]);

	useEffect(() => {
		if (data?.length) setFilteredData(data);
		const newData = filter
			? data?.filter((user) => {
					const findString =
						user.lastName.toLocaleLowerCase().replace(/[^a-zа-яё]/gi, '') +
						user.firstName.toLocaleLowerCase().replace(/[^a-zа-яё]/gi, '') +
						user.lastName.toLocaleLowerCase().replace(/[^a-zа-яё]/gi, '');

					return !!(filter && findString.includes(filter));
			  })
			: data;
		if (newData) setFilteredData(newData);
	}, [data, filter]);

	return (
		<Modal title="Список пользователей" opened={Store.modals.authUsers} onClose={handleClose} size={440}>
			<div ref={focusTrapRef}>
				<Input
					placeholder="Фильтр..."
					iconLeft={<Icon name="filter" />}
					value={filterValue}
					onChange={handleFilter}
					data-autofocus
				/>

				<div className={css.wrapper}>
					{filteredData?.map((user, index) => (
						<div className={css.item} key={`user${index}`}>
							<Avatar
								size="small"
								color={user.color}
								text={`${user.lastName[0]}${user.firstName[0]}`}
								src={user.photo}
								className={css.item__avatar}
							/>

							<Menu
								key={`departmentUserId` + user.id}
								offset={-20}
								width={250}
								control={
									<div>
										<TextField className={css.item__name}>
											{user.firstName} {user.lastName}
										</TextField>

										<TextField size="small" className={css.item__workPosition}>
											{user.workPosition}
										</TextField>
									</div>
								}
							>
								<MenuItemStaffUser data={user} />
							</Menu>

							<Button
								className={css.item__button}
								color="primary"
								onClick={() => {
									// eslint-disable-next-line @typescript-eslint/no-empty-function
									handleAuth(user.username).then(() => {});
								}}
							>
								<Icon name="user" />
							</Button>
						</div>
					))}
				</div>
			</div>
		</Modal>
	);
});
