import { FormItemT } from "../find-contact.types";
import { nameValidate } from "./Name";
import { phoneValidate } from "./Phone";

export const validateAll = async (
	{ form }: Pick<FormItemT, 'form'>
): Promise<boolean>  => {
	const isError = !(await nameValidate({ form })) || !(await phoneValidate({ form }));
	return !isError;
}
