import { useEffect, useMemo, useState } from 'react';
import { Tabs } from '@fsd/shared/ui-kit';
import { useSearch } from '../../lib/useSearch/useSearch';
import { TabOrganizationList, TabOrganizationPanel } from '../tab-organizations/TabOrganization';
import { TabContactList, TabContactPanel } from '../tab-contacts/TabContacts';
import { ISearchTabsProps } from './search-tabs.types';

export const SearchTabs = () => {
	const searchResult = useSearch();
	
	const tabs: ISearchTabsProps[] = useMemo(() => ([
		{
			list: {
				type: TabOrganizationList,
				props: {
					index: 'organization',
					disabled: searchResult?.organizations.length < 1,
					organizations: searchResult?.organizations || null,
				},
				key: null
			},
			panel: {
				type: TabOrganizationPanel,
				props: {
					index: 'organization',
					organizations: searchResult?.organizations || null,
				},
				key: null
			},
		},
		{
			list: {
				type: TabContactList,
				props: {
					index: 'contacts',
					disabled: searchResult?.contacts.length < 1,
					contacts: searchResult?.contacts || null,
				},
				key: null
			},
			panel: {
				type: TabContactPanel,
				props: {
					index: 'contacts',
					contacts: searchResult?.contacts || null,
				},
				key: null
			},
		},
	]), [searchResult]);

	const firstTab = useMemo(() => tabs.find((tab) => !tab.list.props.disabled), [tabs]);
	const [activeTab, setActiveTab] = useState<string | null>(null);

	useEffect(() => {
		if (!firstTab) {
			setActiveTab(null);
			return;
		}
		
		setActiveTab(firstTab.list.props.index);
	}, [firstTab])
	
	return (
		<Tabs 
			// className={css.wrapper}
			value={activeTab}
			onTabChange={setActiveTab}
		>
			<Tabs.List>
				{tabs.map((tab) => {
					const { type: List, props } = tab.list;
					return <List key={props.index} {...props} />;
				})}
			</Tabs.List>

			{tabs.map((tab) => {
				const { type: Panel, props } = tab.panel;
				return <Panel key={props.index} {...props} />;
			})}
		</Tabs>
	);
}
