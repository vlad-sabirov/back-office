import { FormProps } from '../';
import { FormPhoneT } from '../../';

export type PhonesProps = { hasData?: FormPhoneT[]; } & FormProps;
export type PhonesValidateProps = Pick<PhonesProps, 'form' | 'hasData'>;
