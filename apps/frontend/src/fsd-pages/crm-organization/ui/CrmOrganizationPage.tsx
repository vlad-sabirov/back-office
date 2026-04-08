import { FC, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useShowOrganization } from '@fsd/entities/crm-card/lib/useShowDrawer/useShowOrganization';
import { CrmOrganizationService } from '@fsd/entities/crm-organization';
import { CrmContactCardInfoActions } from '@fsd/features/crm-contacts-card-info__new';
import { FetchStatusIsLoading } from '@fsd/shared/lib/fetch-status';
import { useStateActions, useStateSelector } from '@fsd/shared/lib/hooks';
import { Header } from '@fsd/shared/ui-kit';
import { CrmOrganizationAddDrawer } from '@fsd/widgets/crm-organization-add-drawer';
import { CrmOrganizationFilter } from '@fsd/widgets/crm-organization-filter';
import { CrmOrganizationHeaderNavigation } from '@fsd/widgets/crm-organization-header-navigation';
import { CrmOrganizationRightSide } from '@fsd/widgets/crm-organization-right-side';
import { CrmOrganizationTableList } from '@fsd/widgets/crm-organization-table-list';

const CrmOrganizationPage: FC = () => {
	const status = useStateSelector((state) => state.crm_organization.status.list);
	const statusType = useStateSelector((state) => state.crm_organization_type.status.list);
	const statusTag = useStateSelector((state) => state.crm_organization_tag.status.list);
	const isLoading = useMemo(
		() => FetchStatusIsLoading([status, statusType, statusTag]),
		[status, statusType, statusTag]
	);
	const [fetchFindOrg] = CrmOrganizationService.getCurrentById();
	const { query, pathname, push } = useRouter();
	const showOrganization = useShowOrganization();
	const isCardShow = useStateSelector((state) => state.crm_card.isShow);
	const contactCardActions = useStateActions(CrmContactCardInfoActions);

	useEffect(() => {
		if (!query.id) return;
		(async () => {
			const response = await fetchFindOrg({ id: query.id as string });
			if (!('data' in response)) return;
			showOrganization({ id: query.id as string });
		})();
	}, [fetchFindOrg, query.id, showOrganization]);

	useEffect(() => {
		if (query.action === 'addContact' && isCardShow) {
			contactCardActions.setModal(['search', true]);
			push({ pathname, query: { id: query.id } }, undefined, { shallow: true });
		}
	}, [query.action, isCardShow, contactCardActions, pathname, push, query.id]);

	return (
		<>
			<Header
				title={'Организации'}
				contentLeft={<CrmOrganizationFilter loading={isLoading} />}
				contentCenter={<CrmOrganizationHeaderNavigation />}
				contentRight={<CrmOrganizationRightSide loading={isLoading} />}
				loading={isLoading}
			/>
			<CrmOrganizationTableList loading={isLoading} />
			<CrmOrganizationAddDrawer />
		</>
	);
};

export default CrmOrganizationPage;
