import { FC, useEffect, useState } from 'react';
import { useCrmContactActions } from '@fsd/entities/crm-contact';
import { useDebounce, useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon, Input, Tabs } from '@fsd/shared/ui-kit';
import css from './freedom.module.scss';

const tabIndex = 'freedom';

const Content: FC = () => {
	const [searchValue, setSearchValue] = useState<string>();
	const filter = useStateSelector((state) => state.crm_contact.filter.list);
	const search = useStateSelector((state) => state.crm_contact.filter.list.search);
	const actions = useCrmContactActions();

	const handleClear = () => {
		actions.setFilterList({ ...filter, userIds: [0], search: undefined });
		setSearchValue('');
	};

	const handleChangeSearch = useDebounce((val: string) => {
		actions.setFilterList({ ...filter, userIds: [0], page: 1, search: val });
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
		<Tabs.Tab value={tabIndex} icon={<Icon name={'crm-filter-freedom'} />}>
			Свободные
		</Tabs.Tab>
	);
};

export const Freedom = { Tab, Content };
