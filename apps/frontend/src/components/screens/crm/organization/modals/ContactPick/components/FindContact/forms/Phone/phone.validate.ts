import { parsePhoneNumber } from "@helpers";
import { PHONE_CONSTANTS } from "./phone.constants";
import * as Types from "./phone.types";

export const phoneValidate = async (
	{ form }: Types.PhoneValidateT
): Promise<boolean>  => {
	const parsedPhone = parsePhoneNumber(form.values.phone);
	if (!parsedPhone.clear.length) { return true; }

	if (!parsedPhone.valid || parsedPhone.clear.length === 3) {
		form.setFieldError(
			PHONE_CONSTANTS.FIELD_NAME, 
			PHONE_CONSTANTS.VALIDATION.WRONG_FORMAT
		);
		return false;
	}

	return true;
}
