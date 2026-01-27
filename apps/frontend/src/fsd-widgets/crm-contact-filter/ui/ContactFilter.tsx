import { FC, useEffect, useState } from 'react';
import { IContactFilterProps } from './contact-filter.types';
import * as Tab from './tabs';
import { CrmContactConst, useCrmContactActions } from '@fsd/entities/crm-contact';
import { useAccess, useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon, Tabs } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { Popover } from '@mantine/core';

export const ContactFilter: FC<IContactFilterProps> = ({ loading }) => {
	const { team } = useUserDeprecated();
	const filter = useStateSelector((state) => state.crm_contact.filter.list);
	const actions = useCrmContactActions();
	const [activeTab, setActiveTab] = useState<string | null>(null);

	const isMyAccess = useAccess({
		access: CrmContactConst.Access.MyContacts,
		ignoreAdmin: true,
	});

	useEffect(() => {
		setActiveTab(isMyAccess ? 'my' : 'all');
	}, [isMyAccess]);

	return (
		<Popover width={640} shadow="xl" position="right-start" offset={-8} radius={12} withArrow arrowOffset={12}>
			<Popover.Target>
				<div>
					<Button disabled={loading}>
						<Icon name="filter" />
					</Button>
				</div>
			</Popover.Target>

			<Popover.Dropdown>
				<Tabs
					orientation={'vertical'}
					value={activeTab}
					onTabChange={(tab) => {
						setActiveTab(tab);
						if (tab === 'freedom') {
							actions.setFilterList({ ...filter, userIds: [0], search: undefined });
						}
						if (tab === 'all') {
							actions.setFilterList({ ...filter, userIds: undefined, search: undefined });
						}
						if (tab === 'my' && team) {
							actions.setFilterList({ ...filter, userIds: team, search: undefined });
						}
					}}
				>
					<Tabs.List>
						{isMyAccess && <Tab.My.Tab />}
						<Tab.All.Tab />
						<Tab.Freedom.Tab />
					</Tabs.List>

					{activeTab === 'my' && <Tab.My.Content />}
					{activeTab === 'all' && <Tab.All.Content />}
					{activeTab === 'freedom' && <Tab.Freedom.Content />}
				</Tabs>
			</Popover.Dropdown>
		</Popover>
	);
};
