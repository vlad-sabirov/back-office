import { FC, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useShowOrganization } from '@fsd/entities/crm-card/lib/useShowDrawer/useShowOrganization';
import { CrmOrganizationService } from '@fsd/entities/crm-organization';
import { FetchStatusIsLoading } from '@fsd/shared/lib/fetch-status';
import { useStateSelector } from '@fsd/shared/lib/hooks';
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
	const { query } = useRouter();
	const showOrganization = useShowOrganization();

	useEffect(() => {
		if (!query.id) return;
		(async () => {
			const response = await fetchFindOrg({ id: query.id as string });
			if (!('data' in response)) return;
			showOrganization({ id: query.id as string });
		})();
	}, [fetchFindOrg, query.id, showOrganization]);

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
