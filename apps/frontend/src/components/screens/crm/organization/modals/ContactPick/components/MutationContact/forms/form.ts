import { FormItemT } from "../mutation-contact.types";
import { birthdayValidate } from "./Birthday";
import { commentValidate } from "./Comment";
import { emailsValidate } from "./Emails";
import { nameValidate } from "./Name";
import { phonesValidate } from "./Phones";
import { workPositionValidate } from "./WorkPosition";

export const validateAll = async (
	{ form, hasPhoneData, hasEmailData }: Pick<FormItemT, 'form' | 'hasPhoneData' | 'hasEmailData'>
): Promise<boolean>  => {	
	const hasError =
		!(await nameValidate({ form }))
		|| !(await workPositionValidate({ form }))
		|| !(await phonesValidate({ form, hasPhoneData }))
		|| !(await emailsValidate({ form, hasEmailData }))
		|| !(await birthdayValidate({ form }))
		|| !(await commentValidate({ form }));
	return !hasError;
}
