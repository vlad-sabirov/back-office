import { FC, createContext, useContext, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { LeftSection, List, RightSection } from './components';
import OrganizationStore from './organization.store';
import { HeaderContent } from '@components/HeaderContent/HeaderContent';
import { observer } from 'mobx-react-lite';
import { OrganizationProps } from '.';
import { ContentBlock } from '@fsd/shared/ui-kit';
import { OrganizationConst } from './organization.const';

const organizationStore = new OrganizationStore();
export const OrganizationContext = createContext(organizationStore);

const Component: FC<OrganizationProps> = observer(() => {
	const Store = useContext(OrganizationContext);

	const { limit, page, count, timeStamp } = useMemo(
		() => ({
			limit: Store.dataOrganizationListLimit
				|| localStorage.getItem(OrganizationConst.LOCAL_STORE.LIMIT)
				|| 25,
			page: Store.dataOrganizationListPage,
			count: Store.dataOrganizationListCount,
			timeStamp: Store.dataOrganizationListTimeStamp,
		}),
		[
			Store.dataOrganizationListLimit,
			Store.dataOrganizationListPage,
			Store.dataOrganizationListCount,
			Store.dataOrganizationListTimeStamp,
		]
	)

	useEffect(() => {
		Store.getDataOrganizationList({
			include: { user: true, type: true, phones: true, contacts: true },
			limit: Number(limit),
			page: page
		});
		if (Store.dataOrganizationListLimit !== Number(limit)) {
			Store.setDataOrganizationListLimit(Number(limit));
		}
	}, [Store, limit, page, count, timeStamp]);

	useEffect(() => {
		Store.getDataSalesList();
		Store.getDataTypeList();
		Store.getDataTagList();
	}, [Store]);

	return (
		<>
			<Head>
				<title>Организации</title>
			</Head>
			<HeaderContent title={'Организации'} leftSection={<LeftSection />} rightSection={<RightSection />} />
			
			<ContentBlock withoutPaddingX>
				<List organizations={Store.dataOrganizationList} />
			</ContentBlock>
		</>
	);
});

const withHOC = <T extends Record<string, unknown>>(Component: FC<T>) => {
	return function withHOCComponent(props: T) {
		return (
			<OrganizationContext.Provider value={organizationStore}>
				<Component {...props} />
			</OrganizationContext.Provider>
		);
	};
};

export const OrganizationScreen = withHOC(Component);
