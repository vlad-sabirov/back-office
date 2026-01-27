import { FC, useContext, useEffect, useState } from 'react';
import { ContentBlock, Icon, Menu, Progress, Table, TablePropsData, TextField } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { DateSuffix } from '@helpers/DateSuffix';
import { StaffUserWithAvatar } from '@screens/staff';
import { BodyLeftProps } from '.';
import css from './body-left.module.scss';

export const BodyLeft: FC<BodyLeftProps> = ({ data, setCurrentLateness, className }) => {
	const [tableData, setTableData] = useState<TablePropsData>();
	const { templateStore } = useContext(MainContext);

	useEffect(() => {
		setTableData({
			header: [
				{ key: 'staff', label: 'Сотрудник', width: '250px' },
				{ key: 'attendance', label: 'Посещаемость' },
				{ key: 'late', label: 'Пропущено', width: '150px' },
			],
			sortKeys: ['late', 'staff', 'attendance'],
			sortDefault: 'desc',
			body: data.length
				? data.map((dataItem) => {
						const lateHours = dataItem.calculate ? Math.floor(dataItem.calculate.lateMinutes / 60) : '';

						const StaffDisplay = (
							<StaffUserWithAvatar
								user={dataItem.user}
								content={
									<Menu.Item
										onClick={() => {
											setCurrentLateness(dataItem);
											templateStore.bodyRef?.current?.scrollTo({ top: 270, behavior: 'smooth' });
										}}
										color={'blue'}
										icon={<Icon name={'information'} />}
										iconRight={<Icon name={'arrow-small'} className={css.iconArrowRight} />}
									>
										Полная информация
									</Menu.Item>
								}
								className={css.staff}
							/>
						);

						const AttendanceDisplay = dataItem.calculate ? (
							<Progress
								label={dataItem.calculate?.latePercent + '%' ?? ''}
								labelDirection={'right'}
								value={dataItem.calculate?.latePercent ?? 0}
								size={'extraSmall'}
								color={
									dataItem.calculate.latePercent <= 50
										? 'red'
										: dataItem.calculate.latePercent < 90
										? 'yellow'
										: 'green'
								}
								className={css.attendance}
							/>
						) : (
							''
						);

						const LateDisplay = (
							<TextField className={css.late}>
								{DateSuffix(Number(lateHours), ['час', 'часа', 'часов'], true)}
							</TextField>
						);

						return {
							staff: { output: StaffDisplay, index: dataItem.user.lastName + dataItem.user.firstName },
							attendance: { output: AttendanceDisplay, index: dataItem.calculate?.latePercent ?? 0 },
							late: { output: LateDisplay, index: dataItem.calculate?.lateMinutes ?? 0 },
						};
				})
				: [],
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, setCurrentLateness]);

	return (
		<ContentBlock className={className} withoutPaddingX>
			{!!tableData && <Table data={tableData} />}
		</ContentBlock>
	);
};
