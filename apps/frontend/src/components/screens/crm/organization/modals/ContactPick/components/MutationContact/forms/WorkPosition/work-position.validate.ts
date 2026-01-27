import { trim } from "lodash";
import { WORK_POSITION_CONSTANTS } from ".";
import * as Types from "./work-position.types";

export const workPositionValidate = async (
	{ form }: Types.WorkPositionValidateT
): Promise<boolean>  => {
	const newWorkPosition = trim(form.values.workPosition.replace(/[^a-zA-Zа-яА-Я]/g, ''));

	if (!newWorkPosition.length) {
		form.setFieldError(
			WORK_POSITION_CONSTANTS.FIELD_NAME, 
			WORK_POSITION_CONSTANTS.VALIDATION.IS_EMPTY
		);
		return false;
	}

	if (newWorkPosition.length < 3) {
		form.setFieldError(
			WORK_POSITION_CONSTANTS.FIELD_NAME, 
			WORK_POSITION_CONSTANTS.VALIDATION.WRONG_FORMAT
		);
		return false;
	}

	return true;
}
