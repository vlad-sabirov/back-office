import { FormProps } from '../';
import { FormEmailT } from '../../';

export type EmailsProps =  { hasData?: FormEmailT[]; } & FormProps;
export type EmailsValidateProps = Pick<EmailsProps, 'form' | 'hasData'>;
