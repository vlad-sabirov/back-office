import { FC, useEffect, useState } from 'react';
import { CrmOrganizationConst, useCrmOrganizationActions } from '@fsd/entities/crm-organization';
import { CrmOrganizationTagsForm } from '@fsd/entities/crm-organization-tag';
import { useAccess, useDebounce, useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon, Input, Tabs } from '@fsd/shared/ui-kit';
import css from './unverified.module.scss';

const tabIndex = 'unverified';

const Content: FC = () => {
	const [searchValue, setSearchValue] = useState<string>();
	const filter = useStateSelector((state) => state.crm_organization.filter.list);
	const search = useStateSelector((state) => state.crm_organization.filter.list.search);
	const tags: string[] = useStateSelector((state) => state.crm_organization.filter.list.tags) || [];
	const actions = useCrmOrganizationActions();

	const handleChangeTags = (tags: string[]) => {
		actions.setFilterList({ ...filter, tags });
	};

	const handleClear = () => {
		actions.setFilterList({ ...filter, userIds: undefined, isVerified: false, search: undefined, tags: undefined });
		setSearchValue('');
	};

	const handleChangeSearch = useDebounce((val: string) => {
		actions.setFilterList({
			...filter,
			userIds: undefined,
			ignoreUserIds: [],
			isVerified: false,
			page: 1,
			search: val,
			tags,
		});
	}, 300);

	useEffect(() => {
		setSearchValue(search);
	}, [search]);

	return (
		<Tabs.Panel value={tabIndex}>
			<div className={css.wrapper}>
				<Input
					label={'Текстовый поиск'}
					value={searchValue}
					onChange={(e) => {
						setSearchValue(e.target.value);
						handleChangeSearch(e.target.value);
					}}
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
	const count = useStateSelector((state) => state.crm_organization.count.unverified);
	const isAdmin = useAccess({ access: CrmOrganizationConst.Access.Admin });

	return (
		<Tabs.Tab value={tabIndex} icon={<Icon name={'crm-filter-unverified'} />}>
			Не подтвержденные {!!count && isAdmin && <span className={css.badgeUnverified}>{count}</span>}
		</Tabs.Tab>
	);
};

export const Unverified = { Tab, Content };
