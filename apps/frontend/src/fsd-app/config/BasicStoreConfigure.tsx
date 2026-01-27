import { FC } from 'react';
import { useStoreConfigureContact } from '@fsd/entities/crm-contact';
import { useStoreConfigureOrganization } from '@fsd/entities/crm-organization';
import { useCrmStoreConfigureOrganizationTag } from '@fsd/entities/crm-organization-tag';
import { useStoreConfigureOrganizationType } from '@fsd/entities/crm-organization-type';
import { useCrmWorkingBaseStateConfigure } from '@fsd/entities/crm-working-base';
import { useStoreConfigureStaff } from '@fsd/entities/staff';
import { useTodoStoreConfig } from '@fsd/entities/todo';
import { useVoipStateConfigure } from '@fsd/entities/voip';

export const BasicStoreConfigure: FC = () => {
	// Staff
	useStoreConfigureStaff();

	// CRM
	useStoreConfigureOrganization();
	useStoreConfigureOrganizationType();
	useCrmStoreConfigureOrganizationTag();
	useStoreConfigureContact();
	useCrmWorkingBaseStateConfigure();

	// Voip
	useVoipStateConfigure();

	// Planner
	useTodoStoreConfig();

	return null;
};
