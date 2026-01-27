import { FC } from 'react';
import { CrmOrganizationConst } from '@fsd/entities/crm-organization';
import { CrmOrganizationAddButton } from '@fsd/features/crm-organization-add-button';
import { CrmOrganizationSetting } from '@fsd/features/crm-organization-setting';
import { CrmOrganizationTagDeleteModal } from '@fsd/features/crm-organization-tag-delete-modal';
import { CrmOrganizationTagListModal } from '@fsd/features/crm-organization-tag-list-modal';
import { CrmOrganizationTagMutationModal } from '@fsd/features/crm-organization-tag-mutation-modal';
import { CrmOrganizationTypeDeleteModal } from '@fsd/features/crm-organization-type-delete-modal';
import { CrmOrganizationTypeListModal } from '@fsd/features/crm-organization-type-list-modal';
import { CrmOrganizationTypeMutationModal } from '@fsd/features/crm-organization-type-mutation-modal';
import { useAccess } from '@fsd/shared/lib/hooks';
import { OrganizationAddDrawer } from '@screens/crm/organization/drawers';
import { IOrganizationRightSideProps } from '../types/organization-right-side.props';

export const OrganizationRightSide: FC<IOrganizationRightSideProps> = ({ loading }) => {
	const isAccessAddOrganization = useAccess({ access: CrmOrganizationConst.Access.AddOrganization });
	const isAdmin = useAccess({ access: CrmOrganizationConst.Access.Admin });

	return (
		<>
			{isAccessAddOrganization && (
				<>
					<CrmOrganizationAddButton loading={loading} />
					<OrganizationAddDrawer />
				</>
			)}

			{isAdmin && (
				<>
					<CrmOrganizationSetting loading={loading} />
					<CrmOrganizationTypeListModal />
					<CrmOrganizationTypeMutationModal />
					<CrmOrganizationTypeDeleteModal />
					<CrmOrganizationTagListModal />
					<CrmOrganizationTagMutationModal />
					<CrmOrganizationTagDeleteModal />
				</>
			)}
		</>
	);
};
