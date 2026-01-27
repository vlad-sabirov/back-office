import { CrmOrganizationResponse } from '@interfaces/crm';
import { TextFieldProps } from '@fsd/shared/ui-kit';

export type UserT = {
	organization: CrmOrganizationResponse;
} & TextFieldProps;
