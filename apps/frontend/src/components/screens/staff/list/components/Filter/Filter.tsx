import { FC, useContext, useEffect, useState } from 'react';
import { IOnFilterProps } from './interfaces';
import { observer } from 'mobx-react-lite';
import { Button, Icon, Input, SegmentedControl, Select } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { Popover, Tooltip } from '@mantine/core';
import { useForm } from '@mantine/form';
import { FilterProps } from './props';
import css from './styles.module.scss';

export const Filter: FC<FilterProps> = observer(({ onFilter }): JSX.Element => {
	const { staffStore } = useContext(MainContext);
	const [opened, setOpened] = useState(false);

	const defaultFilter: IOnFilterProps = {
		search: '',
		department: null,
		territory: null,
		state: '0',
	};

	const form = useForm({ initialValues: defaultFilter });

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => onFilter(form.values), [form.values]);

	const handleClearFilter = () => {
		form.setFieldValue('search', defaultFilter.search);
		form.setFieldValue('department', defaultFilter.department);
		form.setFieldValue('territory', defaultFilter.territory);
		form.setFieldValue('state', defaultFilter.state);
	};

	const department = [
		{
			label: staffStore.departmentParent ? staffStore.departmentParent.name : '-',
			value: staffStore.departmentParent ? String(staffStore.departmentParent.id) : '-',
		},
	];
	if (staffStore.departmentChildList)
		department.push(
			...staffStore.departmentChildList.map((department) => ({
				label: department.name,
				value: String(department.id),
			}))
		);

	const territory = staffStore.territoryList
		? staffStore.territoryList.map((territory) => ({
				label: territory.name,
				value: String(territory.id),
			}))
		: [];

	return (
		<>
			<Popover
				opened={opened}
				onClose={() => setOpened(false)}
				shadow="xl"
				position="right-start"
				offset={-8}
				radius={12}
				withArrow
				arrowOffset={12}
			>
				<Popover.Target>
					<div>
						<Tooltip label={'Фильтровать сотрудников'} withArrow openDelay={1000} transitionDuration={300}>
							<div>
								<Button color="neutral" variant="easy" onClick={() => setOpened((o) => !o)}>
									<Icon name="filter" />
								</Button>
							</div>
						</Tooltip>
					</div>
				</Popover.Target>
				<Popover.Dropdown>
					<div className={css.wrapper}>
						<Input label="ФИО или телефон" className={css.search} {...form.getInputProps('search')} />

						<Select
							label="Отдел"
							clearable
							data={department}
							value={form.values.department}
							onChange={(value) => {
								form.setFieldValue('department', value as string);
							}}
							className={css.department}
						/>

						<Select
							label="Территория"
							clearable
							data={territory}
							value={form.values.territory}
							onChange={(value) => {
								form.setFieldValue('territory', value as string);
							}}
							className={css.territory}
						/>

						<SegmentedControl
							label="Состояние"
							data={[
								{ label: 'Работает', value: '0' },
								{ label: 'Уволен(а)', value: '1' },
							]}
							value={form.values.state}
							onChange={(value) => {
								form.setFieldValue('state', value);
							}}
							className={css.state}
						/>

						<div className={css.buttonWrapper}>
							<Button iconLeft={<Icon name="filter-clean" />} onClick={handleClearFilter}>
								Очистить фильтр
							</Button>
						</div>
					</div>
				</Popover.Dropdown>
			</Popover>
		</>
	);
});
