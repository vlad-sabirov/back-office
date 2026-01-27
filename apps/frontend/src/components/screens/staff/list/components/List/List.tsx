import { FC, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Table, TablePropsData, TextField } from '@fsd/shared/ui-kit';
import { StaffUserWithAvatar } from '@screens/staff/shared';
import { ListProps } from '.';
import css from './styles.module.scss';
import { CallButtonWithText } from '@fsd/shared/ui-kit/button/items';
import { useStateSelector } from '@fsd/shared/lib/hooks';

export const List: FC<ListProps> = observer(({ data }) => {
	const [tableData, setTableData] = useState<TablePropsData>();
	const userId = useStateSelector((state) => state.app.auth.userId);

	useEffect(() => {
		if (!data) return;

		if (data.length > 0) {
			setTableData({
				header: [
					{ key: 'name', label: 'ФИО сотрудника' },
					{ key: 'workPosition', label: 'Должность' },
					{ key: 'department', label: 'Отдел' },
					{ key: 'phoneVoip', label: 'Внутренний' },
					{ key: 'phoneMobile', label: 'Мобильный' },
					{ key: 'territory', label: 'Территория' },
				],
				sortKeys: ['name', 'department', 'phoneVoip', 'phoneMobile', 'territory'],
				body: data.map((user) => {
					return {
						name: {
							output: (
								<>
									<StaffUserWithAvatar user={user} className={css.user} />
								</>
							),
							index: user.lastName,
						},

						workPosition: {
							index: user.workPosition,
							output: <TextField size="small">{user.workPosition}</TextField>,
						},

						department: {
							index: user.department ? user.department.name : '',
							output: <TextField size="small">{user.department ? user.department.name : ''}</TextField>,
						},

						phoneVoip: {
							index: user.phoneVoip,
							output: (
								<CallButtonWithText
									key={user.id}
									phone={user.phoneVoip}
									size={'small'}
									whoDescription={`${user.lastName} ${user.firstName}`}
									disabled={user.id === Number(userId)}
								/>
							)
						},

						phoneMobile: {
							index: user.phoneMobile,
							output: (
								<CallButtonWithText
									key={user.id}
									phone={user.phoneMobile}
									size={'small'}
									whoDescription={`${user.lastName} ${user.firstName}`}
									disabled={user.id === Number(userId)}
								/>
							),
						},

						territory: {
							index: user.territory ? user.territory.name : '',
							output: <TextField size="small">{user.territory ? user.territory.name : ''}</TextField>,
						},
					};
				}),
			});
		}
	}, [userId, data]);

	return <Table data={tableData as TablePropsData} />;
});
