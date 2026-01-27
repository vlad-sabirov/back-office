import { trim } from "lodash";
import { NAME_CONSTANTS } from ".";
import * as Types from "./name.types";

export const nameValidate = async (
	{ form }: Types.NameValidateT
): Promise<boolean>  => {
	const newName = trim(form.values.name.replace(/[^a-zA-Zа-яА-Я]/g, ''));

	if (newName.length < 3) {
		form.setFieldError(
			NAME_CONSTANTS.FIELD_NAME, 
			NAME_CONSTANTS.VALIDATION.WRONG_LENGTH
		);
		return false;
	}

	return true;
}
