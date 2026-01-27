import { FormProps } from '..';
import { RequisiteAddFormT } from '../..';

export type NameProps = {
	hasData?: RequisiteAddFormT[];
} &   FormProps;
export type NameValidateProps =
	Pick<FormProps, 'form'>
	& Pick<NameProps, 'hasData'>;
