// Entity
export type { IPhoneEntity as ICrmPhoneEntity } from './entity';
export type { IPhoneCreateEntity as ICrmPhoneCreateEntity } from './entity';
export type { IPhoneFormEntity as ICrmPhoneFormEntity } from './entity';

// Model
export { Api as CrmPhoneApi } from './model/service';
export { Service as CrmPhoneService } from './model/service';

// UI
export { CardPhones as CrmCardPhones } from '@fsd/entities/crm-phone/ui/card-phones/CardPhones';
export { FormPhones as CrmPhonesForm } from '@fsd/entities/crm-phone/ui/form-phones/FormPhones';
export { useValidate as useValidateCrmPhonesForm } from '@fsd/entities/crm-phone/ui/form-phones/useValidate';

// Deprecated
export { FormPhones as CrmPhonesFormDeprecated } from '@fsd/entities/crm-phone/ui/form-phones__deprecated/FormPhones';
// eslint-disable-next-line max-len
export { useValidate as useValidateCrmPhonesFormDeprecated } from '@fsd/entities/crm-phone/ui/form-phones__deprecated/useValidate';
