import { FC, useContext, useEffect, useState } from 'react';
import { Filter, List, RightSection } from './components';
import { IOnFilterProps } from './components/Filter/interfaces';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { ContentBlock, TextField } from '@fsd/shared/ui-kit';
import { HeaderContent } from '@components/HeaderContent/HeaderContent';
import { MainContext } from '@globalStore';
import { IUserResponse } from '@interfaces/user/UserList.response';
import UserService from '@services/User.service';
import { useGetData } from '../shared/hooks/useGetData';

export const StaffList: FC = observer(() => {
	useGetData();
	const { staffStore } = useContext(MainContext);
	const [src, setSrc] = useState<IUserResponse[]>();
	const [data, setData] = useState<IUserResponse[]>([]);
	const [filter, setFilter] = useState<IOnFilterProps>();
	const [filterTimerId, setFilterTimerId] = useState<NodeJS.Timeout>();

	useEffect(() => {
		let isMounted = true;
		(async () => {
			const [allUsers] = await UserService.findEverything();
			if (isMounted) setSrc(allUsers);
		})();
		return () => {
			isMounted = false;
		};
	}, [staffStore.userList]);

	useEffect(() => {
		let isMounted = true;

		if (!filter) return;
		if (filterTimerId) clearTimeout(filterTimerId);

		const newTimer = setTimeout(() => {
			const filteredUsers = src
				?.filter((user) =>
					filter?.search
						? (user.lastName + user.firstName + user.lastName)
								.toLocaleLowerCase()
								.includes(filter.search.toLocaleLowerCase()) ||
						user.phoneMobile.includes(filter.search) ||
						user.phoneVoip.includes(filter.search)
						: true
				)
				.filter((user) => user.isFired === !!Number(filter?.state))
				.filter((user) => (filter?.department ? user.departmentId === Number(filter?.department) : true))
				.filter((user) => (filter?.territory ? user.territoryId === Number(filter?.territory) : true));

			if (isMounted) setData(filteredUsers || []);
		}, 250);
		setFilterTimerId(newTimer);

		return () => {
			isMounted = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filter, src]);

	return (
		<>
			<Head>
				<title>Список сотрудников. Back Office</title>
			</Head>
			<HeaderContent
				title="Список сотрудников"
				leftSection={<Filter onFilter={(value) => setFilter(value)} />}
				rightSection={<RightSection />}
			/>

			<ContentBlock withoutPaddingX>
				{data.length ? (
					<List data={data} />
				) : filter ? (
					<TextField mode="heading" style={{ textAlign: 'center', margin: '20px 0px' }}>
						Сотрудники не найдены
					</TextField>
				) : null}
			</ContentBlock>
		</>
	);
});
