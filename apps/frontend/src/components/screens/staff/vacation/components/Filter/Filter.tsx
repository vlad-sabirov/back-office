import { FC, useContext, useEffect } from 'react';
import { endOfYear, format, parse, startOfYear } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { Button, DateRangePicker, Icon, MultiSelect, Select, Switch } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { Popover } from '@mantine/core';
import { VacationContext } from '../../Vacation';
import { FilterProps } from '.';
import css from './filter.module.scss';

export const Filter: FC<FilterProps> = observer(({ ...props }) => {
	const { staffStore } = useContext(MainContext);
	const { vacationStore } = useContext(VacationContext);

	const handleChangeDate = (date: [Date | null, Date | null]): void => {
		if (!date[0] || !date[1]) return;
		vacationStore.setDate({ dateStart: format(date[0], 'yyyy-MM-dd'), dateEnd: format(date[1], 'yyyy-MM-dd') });
	};

	const handleChangeUserId = (userId: number | string | undefined): void => {
		vacationStore.setFilterUserId(userId);
	};

	const handleChangeIsFake = (value: boolean): void => {
		vacationStore.setFilterIsFake(value);
	};

	const handleChangeDepartmentId = (departmentId: string | null): void => {
		vacationStore.setFilterDepartmentId(departmentId);
	};

	const handleChangeTerritoryId = (territoryId: string | null): void => {
		vacationStore.setFilterTerritoryId(territoryId);
	};

	const handleFilterReset = (): void => {
		vacationStore.setDate({
			dateStart: format(startOfYear(new Date()), 'yyyy-MM-dd'),
			dateEnd: format(endOfYear(new Date()), 'yyyy-MM-dd'),
		});
		vacationStore.setFilterUserId(undefined);
		vacationStore.setFilterDepartmentId(null);
		vacationStore.setFilterTerritoryId(null);
	};

	useEffect(() => {
		staffStore.getDepartmentList();
		staffStore.getTerritoryList();
	}, [staffStore]);

	return (
		<Popover shadow="xl" position="right-start" offset={-8} radius={12} withArrow arrowOffset={12}>
			<Popover.Target>
				<div {...props}>
					<Button>
						<Icon name={'filter'} />
					</Button>
				</div>
			</Popover.Target>

			<Popover.Dropdown>
				<div className={css.wrapper}>
					<DateRangePicker
						label={'Диапазон дат'}
						value={[
							parse(vacationStore.date.dateStart, 'yyyy-MM-dd', new Date()),
							parse(vacationStore.date.dateEnd, 'yyyy-MM-dd', new Date()),
						]}
						onChange={(value) => handleChangeDate(value)}
						className={css.date}
						disabled={vacationStore.isLoading}
					/>

					<Switch
						label={'Фейки'}
						className={css.isFake}
						checked={vacationStore.filterIsFake}
						onChange={(value) => handleChangeIsFake(value.currentTarget.checked)}
					/>

					<Select
						data={staffStore.departmentChildList.map((department) => ({
							value: String(department.id),
							label: department.name,
						}))}
						value={String(vacationStore.filterDepartmentId)}
						onChange={(value) => handleChangeDepartmentId(value)}
						searchable
						label="Отдел"
						className={css.department}
						disabled={vacationStore.isLoading || !!vacationStore.filterUserId}
					/>

					<Select
						data={staffStore.territoryList.map((territory) => ({
							value: String(territory.id),
							label: territory.name,
						}))}
						value={String(vacationStore.filterTerritoryId)}
						onChange={(value) => handleChangeTerritoryId(value)}
						searchable
						label="Территория"
						className={css.territory}
						disabled={vacationStore.isLoading || !!vacationStore.filterUserId}
					/>

					<MultiSelect
						data={staffStore.userList.map((user) => ({
							value: String(user.id),
							label: `${user.lastName} ${user.firstName}`,
							letters: user.lastName[0] + user.firstName[0],
							color: user.color,
							photo: user.photo,
						}))}
						value={[String(vacationStore.filterUserId)]}
						onChange={(value) => handleChangeUserId(value[0])}
						searchable
						mode="staff"
						label="Сотрудник"
						maxSelectedValues={1}
						className={css.user}
						disabled={
							vacationStore.isLoading ||
							!!vacationStore.filterTerritoryId ||
							!!vacationStore.filterDepartmentId
						}
					/>

					<div className={css.button}>
						<Button onClick={handleFilterReset} iconLeft={<Icon name={'filter-clean'} />}>
							Очистить фильтр
						</Button>
					</div>
				</div>
			</Popover.Dropdown>
		</Popover>
	);
});
