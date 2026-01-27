import { FC, useState } from 'react';
import { endOfMonth, formatISO, parse, startOfMonth } from 'date-fns';
import { useCrmOrganizationActions } from '@fsd/entities/crm-organization';
import { CrmOrganizationTagsForm } from '@fsd/entities/crm-organization-tag';
import { useDebounce, useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, DateMonthPicker, DateMonthPickerPropsValue, Icon, Tabs } from '@fsd/shared/ui-kit';
import css from 'fsd-widgets/crm-organization-filter/ui/tabs/new/new.module.scss';

const tabIndex = 'new';

const Content: FC = () => {
	const dateOfNew = useStateSelector((state) => state.crm_organization.filter.dateOfNew);
	const [date, setDate] = useState<DateMonthPickerPropsValue | null>(dateOfNew);
	const filter = useStateSelector((state) => state.crm_organization.filter.list);
	const tags: string[] = useStateSelector((state) => state.crm_organization.filter.list.tags) || [];
	const actions = useCrmOrganizationActions();
	const orgActions = useCrmOrganizationActions();

	const handleChangeTags = (tags: string[]) => {
		actions.setFilterList({ ...filter, tags });
	};

	const handleClear = () => {
		actions.setFilterList({ ...filter, isVerified: true, search: undefined, tags: undefined });
		setDate(null);
	};

	const handleChangeSearch = useDebounce(({ year, month }: DateMonthPickerPropsValue) => {
		actions.setFilterList({
			...filter,
			userIds: undefined,
			page: 1,
			ignoreUserIds: [],
			isVerified: true,
			createdAt: {
				start: formatISO(startOfMonth(parse(`${year}-${month}`, 'yyyy-MM', new Date()))),
				end: formatISO(endOfMonth(parse(`${year}-${month}`, 'yyyy-MM', new Date()))),
			},
			tags,
		});
	}, 300);

	return (
		<Tabs.Panel value={tabIndex}>
			<div className={css.wrapper}>
				<DateMonthPicker
					label={'Месяц'}
					value={date}
					onChange={(val) => {
						if (!val) return;
						setDate(val);
						handleChangeSearch(val);
						orgActions.setFilterDateOfNew(val);
					}}
					minDate={new Date('2023-7-1')}
					maxDate={new Date()}
				/>

				<CrmOrganizationTagsForm value={tags} onChange={handleChangeTags} error={''} onError={() => null} />

				<div className={css.buttons}>
					<Button
						color={'info'}
						iconLeft={<Icon name={'plus-medium'} className={css.clearIcon} />}
						className={css.clearButton}
						onClick={handleClear}
					>
						Очистить
					</Button>
				</div>
			</div>
		</Tabs.Panel>
	);
};

const Tab: FC = () => {
	return (
		<Tabs.Tab value={tabIndex} icon={<Icon name={'crm-filter-new'} />}>
			Новые
		</Tabs.Tab>
	);
};

export const New = { Tab, Content };
