import { CrmOrganizationResponse } from '@interfaces/crm';
import { TextFieldProps } from '@fsd/shared/ui-kit';

export type PhonesT = {
	organization: CrmOrganizationResponse;
} & TextFieldProps;
