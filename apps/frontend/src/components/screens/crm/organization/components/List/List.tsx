import { FC, useContext, useEffect, useState } from 'react';
import { Contacts, Name, Phones, Type, User } from './components';
import { observer } from 'mobx-react-lite';
import { Pagination, Table, TablePropsData } from '@fsd/shared/ui-kit';
import { OrganizationContext } from '../..';
import { OrganizationConst } from '../../organization.const';
import { ListT } from '.';
import css from './list.module.scss';

export const List: FC<ListT> = observer(({ organizations, ...props }) => {
	const Store = useContext(OrganizationContext);
	const [tableData, setTableData] = useState<TablePropsData | null>(null);

	const handleChangeLimit = (limit: number) => {
		Store.setDataOrganizationListLimit(limit);
		localStorage.setItem(OrganizationConst.LOCAL_STORE.LIMIT, limit.toString());
	};

	const handlePageChange = (page: number) => {
		Store.setDataOrganizationListPage(page);
	};

	useEffect(() => {
		if (!organizations) return;
		setTableData({
			header: [
				{ key: 'name', label: 'Название', width: '400px' },
				{ key: 'user', label: 'Ответственный', width: '200px' },
				{ key: 'type', label: 'Сфера деятельности', width: '200px' },
				{ key: 'contacts', label: 'Контакты', width: '175px' },
				{ key: 'phones', label: 'Телефоны', width: '175px' },
			],
			sortKeys: ['name', 'user', 'type'],
			body: organizations.length
				? organizations.map((organization) => {
						return {
							name: {
								output: <Name organization={organization} />,
								index: organization.nameEn,
							},
							user: {
								output: <User organization={organization} />,
								index: organization.user
									? `${organization.user?.lastName}${organization.user?.firstName}`
									: 'Общий котел',
							},
							type: {
								output: <Type organization={organization} />,
								index: organization.type?.name ?? 'Другое',
							},
							contacts: {
								output: <Contacts organization={organization} />,
								index: '',
							},
							phones: {
								output: <Phones organization={organization} />,
								index: '',
							},
						};
				  })
				: undefined,
		});
	}, [organizations]);

	return (
		<div className={css.wrapper} {...props}>
			<Table data={tableData} />
			<div className={css.footer}>
				<Pagination
					page={Store.dataOrganizationListPage}
					total={Store.dataOrganizationListCount}
					limit={Store.dataOrganizationListLimit}
					onChangePage={handlePageChange}
					onChangeLimit={handleChangeLimit}
				/>
			</div>
		</div>
	);
});
