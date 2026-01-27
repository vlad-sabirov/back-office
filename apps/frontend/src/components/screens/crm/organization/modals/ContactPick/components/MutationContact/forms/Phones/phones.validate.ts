import { parsePhoneNumber, stringFormatToLetters } from "@helpers";
import { CrmPhoneService } from "@services";
import { trim } from "lodash";
import { PHONES_CONSTANTS } from ".";
import * as Types from "./phones.types";

export const phonesValidate = async (
	{ form, hasPhoneData }: Types.PhonesValidateT
): Promise<boolean>  => {
	const phones = form.values.phones;	
	let index = 0;
	for (const phoneItem of phones) {
		const phone = parsePhoneNumber(phoneItem.value);
		const comment = stringFormatToLetters(phoneItem.comment);

		if (!phone.clear.length) {
			++index;
			continue;
		}

		if (!phone.valid || phone.clear.length === 3) {
			form.setFieldError(
				`phones.${index}.value`, 
				PHONES_CONSTANTS.VALIDATION.WRONG_FORMAT
			);
			++index;
			return false;
		}

		if (trim(phoneItem.comment).length > 0 && comment.length < 3) {
			form.setFieldError(
				`phones.${index}.comment`, 
				PHONES_CONSTANTS.VALIDATION.MIN_LENGTH
			);
			++index;
			return false;
		}

		if (comment.length > 42) {
			form.setFieldError(
				`phones.${index}.comment`, 
				PHONES_CONSTANTS.VALIDATION.MAX_LENGTH
			);
			++index;
			return false;
		}

		if (phones
			.filter((_, i) => i != index)
			.some((item) => parsePhoneNumber(item.value).clear === phone.clear )
		) {
			form.setFieldError(
				`phones.${index}.value`, 
				PHONES_CONSTANTS.VALIDATION.FOUND_DUPLICATE
			);
			++index;
			return false;
		}

		
		if (hasPhoneData?.length && hasPhoneData.some((item) => item.value === phone.clear )
		) {
			
			form.setFieldError(
				`phones.${index}.value`, 
				PHONES_CONSTANTS.VALIDATION.FOUND_DUPLICATE
			);
			++index;
			return false;
		}

		const [foundDuplicate] = await CrmPhoneService.findMany({
			where: { value: phone.clear }
		});
		if (foundDuplicate?.length) {
			form.setFieldError(
				`phones.${index}.value`, 
				PHONES_CONSTANTS.VALIDATION.FOUND_DUPLICATE_DB
			);
			++index;
			return false;
		}

		form.setFieldError(`phones.${index}.value`, null);
		++index;
	}

	return true;
}
