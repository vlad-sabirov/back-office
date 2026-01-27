import { FC, useEffect, useState } from "react";
import { StaffSelect } from "@fsd/entities/staff";
import { Button, Icon, Input, Tabs } from "@fsd/shared/ui-kit";
import { useDebounce, useStateSelector } from "@fsd/shared/lib/hooks";
import { useCrmContactActions } from "@fsd/entities/crm-contact";
import css from './all.module.scss';

const tabIndex = 'all';

const Content: FC = () => {
	const [searchValue, setSearchValue] = useState<string>();
	const users = useStateSelector((state) => state.staff.data.sales);
	const filter = useStateSelector((state) => state.crm_contact.filter.list);
	const userIds = useStateSelector((state) => state.crm_contact.filter.list.userIds);
	const search = useStateSelector((state) => state.crm_contact.filter.list.search);
	const actions = useCrmContactActions();
	// const 

	const handleChangeUserId = (val: string[]) => {
		actions.setFilterList({ ...filter, userIds: val });
	}

	const handleClear = () => {
		actions.setFilterList({ ...filter, userIds: undefined, search: undefined });
		setSearchValue('')
	}

	const handleChangeSearch = useDebounce((val: string) => {
		actions.setFilterList({ ...filter, userIds: undefined, page: 1, search: val });
	}, 300);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => { setSearchValue(search); }, []); 

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

				<StaffSelect 
					label={'Ответственный'} 
					users={users} 
					value={userIds?.map((id) => String(id)) || []}
					onChange={handleChangeUserId}
					limit={0}
					disabled={!!search}
				/>

				<div className={css.buttons}>
					<Button
						color={'info'}
						iconLeft={<Icon name={'plus-medium'} className={css.clearIcon} />}
						className={css.clearButton}
						onClick={handleClear}
					> Очистить </Button>
				</div>
			</div>
		</Tabs.Panel>
	);
}

const Tab: FC = () => {
	return (
		<Tabs.Tab 
			value={tabIndex} 
			icon={<Icon name={'crm-filter-all'} 
		/>}> Все </Tabs.Tab>
	);
}

export const All = { Tab, Content }
