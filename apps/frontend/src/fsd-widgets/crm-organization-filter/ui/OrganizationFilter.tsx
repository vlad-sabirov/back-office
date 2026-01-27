import { FC, useEffect, useState } from 'react';
import { IOrganizationFilterProps } from './organization-filter.types';
import * as Tab from './tabs';
import { endOfMonth, formatISO, startOfMonth } from 'date-fns';
import { CrmOrganizationConst, useCrmOrganizationActions } from '@fsd/entities/crm-organization';
import { useAccess, useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon, Tabs } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { Popover } from '@mantine/core';
import { Access } from '../config/access';
import css from './organization-filter.module.scss';

export const OrganizationFilter: FC<IOrganizationFilterProps> = ({ loading }) => {
	const { team } = useUserDeprecated();
	const filter = useStateSelector((state) => state.crm_organization.filter.list);
	const actions = useCrmOrganizationActions();
	const [activeTab, setActiveTab] = useState<string | null>(null);
	const countUnverified = useStateSelector((state) => state.crm_organization.count.unverified);

	const isAdmin = useAccess({ access: CrmOrganizationConst.Access.Admin });
	const isMyAccess = useAccess({
		access: CrmOrganizationConst.Access.MyOrganization,
		ignoreAdmin: true,
	});
	const hasAccessTab = useAccess({ access: Access.TabNew });

	useEffect(() => {
		setActiveTab(isMyAccess ? 'my' : 'all');
	}, [isMyAccess]);

	return (
		<Popover width={640} shadow="xl" position="right-start" offset={-8} radius={12} withArrow arrowOffset={12}>
			<Popover.Target>
				<div>
					<Button disabled={loading}>
						<Icon name="filter" />
						{!!countUnverified && isAdmin && <span className={css.badgeUnverified}>{countUnverified}</span>}
					</Button>
				</div>
			</Popover.Target>

			<Popover.Dropdown>
				<Tabs
					orientation={'vertical'}
					value={activeTab}
					onTabChange={(tab) => {
						setActiveTab(tab);
						if (tab === 'all') {
							actions.setFilterList({
								...filter,
								userIds: undefined,
								search: undefined,
								isVerified: true,
								isArchive: false,
								ignoreUserIds: [],
								createdAt: undefined,
								tags: undefined,
							});
						}
						if (tab === 'my' && team) {
							actions.setFilterList({ ...filter, userIds: team, search: undefined, isVerified: true });
						}
						if (tab === 'freedom') {
							actions.setFilterList({
								...filter,
								userIds: [0],
								search: undefined,
								ignoreUserIds: [],
								isVerified: true,
								isArchive: false,
								createdAt: undefined,
								tags: undefined,
							});
						}
						if (tab === 'priority') {
							actions.setFilterList({
								...filter,
								userIds: [1],
								search: undefined,
								ignoreUserIds: [],
								isVerified: true,
								isArchive: false,
								createdAt: undefined,
								tags: undefined,
							});
						}
						if (tab === 'unverified') {
							actions.setFilterList({
								...filter,
								userIds: undefined,
								search: undefined,
								isVerified: false,
								isArchive: false,
								ignoreUserIds: [],
								createdAt: undefined,
								tags: undefined,
							});
						}
						if (tab === 'new') {
							actions.setFilterList({
								...filter,
								userIds: undefined,
								search: undefined,
								page: 1,
								ignoreUserIds: [],
								isVerified: true,
								isArchive: false,
								createdAt: {
									start: formatISO(startOfMonth(new Date())),
									end: formatISO(endOfMonth(new Date())),
								},
								tags: undefined,
							});
						}
						if (tab === 'archive') {
							actions.setFilterList({
								...filter,
								userIds: undefined,
								search: undefined,
								isVerified: true,
								isArchive: true,
								ignoreUserIds: [],
								createdAt: undefined,
								tags: undefined,
							});
						}
					}}
				>
					<Tabs.List>
						{isMyAccess && <Tab.My.Tab />}
						<Tab.All.Tab />
						{hasAccessTab && <Tab.New.Tab />}
						<Tab.Unverified.Tab />
						<Tab.Priority.Tab />
						<Tab.Freedom.Tab />
						{hasAccessTab && <Tab.Archive.Tab />}
					</Tabs.List>

					{activeTab === 'my' && <Tab.My.Content />}
					{activeTab === 'all' && <Tab.All.Content />}
					{activeTab === 'new' && hasAccessTab && <Tab.New.Content />}
					{activeTab === 'unverified' && <Tab.Unverified.Content />}
					{activeTab === 'priority' && <Tab.Priority.Content />}
					{activeTab === 'freedom' && <Tab.Freedom.Content />}
					{activeTab === 'archive' && hasAccessTab && <Tab.Archive.Content />}
				</Tabs>
			</Popover.Dropdown>
		</Popover>
	);
};
