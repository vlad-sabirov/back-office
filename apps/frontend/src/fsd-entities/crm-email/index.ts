// Entity
export type { IEmailEntity as ICrmEmailEntity } from './entity';
export type { IEmailCreateEntity as ICrmEmailCreateEntity } from './entity';
export type { IEmailFormEntity as ICrmEmailFormEntity } from './entity';

// Model
export { Api as CrmEmailApi } from './model/service';
export { Service as CrmEmailService } from './model/service';

// UI
export { CardEmails as CrmCardEmails } from './ui/card-emails/CardEmails'
export { FormEmails as CrmEmailsForm } from '@fsd/entities/crm-email/ui/form-emails/FormEmails';
export { useValidate as useValidateCrmEmailsForm } from '@fsd/entities/crm-email/ui/form-emails/useValidate';

// Deprecated
export { FormEmails as CrmEmailsFormDeprecated } from '@fsd/entities/crm-email/ui/form-emails--deprecated/FormEmails';
// eslint-disable-next-line max-len
export { useValidate as useValidateCrmEmailsFormDeprecated } from '@fsd/entities/crm-email/ui/form-emails--deprecated/useValidate';
