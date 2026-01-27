import { FormItemT } from '../../mutation-contact.types';

export type EmailsT = FormItemT;
export type EmailsValidateT = Pick<FormItemT, 'form' | 'hasEmailData'>;
