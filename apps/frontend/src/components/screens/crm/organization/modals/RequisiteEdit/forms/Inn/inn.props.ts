import { FormProps } from '..';
import { RequisiteAddFormT } from "../../../RequisiteAdd";

export type InnProps = {
	hasData?: RequisiteAddFormT[];
} &  FormProps;
export type InnValidateProps =
	Pick<FormProps, 'form'>
	& Pick<InnProps, 'hasData'>;
