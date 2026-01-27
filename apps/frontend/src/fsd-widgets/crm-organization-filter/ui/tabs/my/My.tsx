import { FC, useEffect, useState } from 'react';
import { useCrmOrganizationActions } from '@fsd/entities/crm-organization';
import { CrmOrganizationTagsForm } from '@fsd/entities/crm-organization-tag';
import { useDebounce, useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon, Input, SegmentedControl, Tabs } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import css from './my.module.scss';

const tabIndex = 'my';

const Content: FC = () => {
	const [searchValue, setSearchValue] = useState<string>();
	const filter = useStateSelector((state) => state.crm_organization.filter.list);
	const search = useStateSelector((state) => state.crm_organization.filter.list.search);
	const tags: string[] = useStateSelector((state) => state.crm_organization.filter.list.tags) || [];
	const actions = useCrmOrganizationActions();
	const { userId, team } = useUserDeprecated();
	const [responsible, setResponsible] = useState<string>(() => {
		return filter?.userIds && filter.userIds.length > 1 ? 'team' : 'my';
	});

	const handleChangeResponsible = (responsible: string) => {
		if (!team || !userId) return;
		actions.setFilterList({ ...filter, userIds: responsible === 'team' ? team : [userId], isVerified: true });
	};

	const handleChangeTags = (tags: string[]) => {
		actions.setFilterList({ ...filter, tags });
	};

	const handleClear = () => {
		if (!team) return;
		actions.setFilterList({ ...filter, userIds: team, isVerified: true, search: undefined, tags: undefined });
		setSearchValue('');
		setResponsible('team');
	};

	const handleChangeSearch = useDebounce((val: string) => {
		actions.setFilterList({ ...filter, page: 1, search: val, tags });
	}, 300);

	useEffect(() => {
		setSearchValue(search);
	}, [search]);

	return (
		<Tabs.Panel value={tabIndex}>
			<div className={css.wrapper}>
				{team && team.length > 1 && (
					<SegmentedControl
						label={'Ответственный'}
						value={responsible}
						onChange={(val) => {
							handleChangeResponsible(val);
							setResponsible(val);
						}}
						data={[
							{ label: 'Команда', value: 'team' },
							{ label: 'Мои', value: 'my' },
						]}
					/>
				)}

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
						{' '}
						Очистить{' '}
					</Button>
				</div>
			</div>
		</Tabs.Panel>
	);
};

const Tab: FC = () => {
	return (
		<Tabs.Tab value={tabIndex} icon={<Icon name={'crm-filter-my'} />}>
			{' '}
			Мои{' '}
		</Tabs.Tab>
	);
};

export const My = { Tab, Content };
