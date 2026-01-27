import { FormItemT } from '../../mutation-contact.types';

export type PhonesT = FormItemT;
export type PhonesValidateT = Pick<FormItemT, 'form' | 'hasPhoneData'>;
