import { parse, sub } from "date-fns";
import { BIRTHDAY_CONSTANTS } from ".";
import * as Types from "./birthday.types";

const DATE_NOW = new Date()

export const birthdayValidate = async (
	{ form }: Types.BirthdayValidateT
): Promise<boolean>  => {
	if (form.values.birthday === '') return true;
	const birthday = parse(form.values.birthday, 'yyyy-MM-dd', new Date());

	if (birthday > sub(DATE_NOW, { years: 18 }) || birthday < sub(DATE_NOW, { years: 150 })) {
		form.setFieldError(
			BIRTHDAY_CONSTANTS.FIELD_NAME, 
			BIRTHDAY_CONSTANTS.VALIDATION.WRONG_AGE
		);
		return false;
	}

	return true;
}
