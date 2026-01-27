import { stringFormatToLetters } from "@helpers";
import { CrmEmailService } from "@services";
import { trim } from "lodash";
import { EMAILS_CONSTANTS } from ".";
import * as Types from "./emails.types";

export const emailsValidate = async (
	{ form, hasEmailData }: Types.EmailsValidateT
): Promise<boolean>  => {
	const emails = form.values.emails;	
	let index = 0;
	for (const emailItem of emails) {
		const email = trim(emailItem.value);
		const comment = stringFormatToLetters(emailItem.comment);

		if (!email.length) {
			++index;
			continue;
		}

		if (comment.length > 42) {
			form.setFieldError(
				`emails.${index}.comment`, 
				EMAILS_CONSTANTS.VALIDATION.MAX_LENGTH
			);
			++index;
			return false;
		}

		if (emails.filter((_, i) => i != index).some((item) => item.value === email )) {
			form.setFieldError(
				`emails.${index}.value`, 
				EMAILS_CONSTANTS.VALIDATION.FOUND_DUPLICATE
			);
			++index;
			return false;
		}

		
		if (hasEmailData?.length && hasEmailData.some((item) => item.value === email )
		) {
			
			form.setFieldError(
				`emails.${index}.value`, 
				EMAILS_CONSTANTS.VALIDATION.FOUND_DUPLICATE
			);
			++index;
			return false;
		}

		const [foundDuplicate] = await CrmEmailService.findMany({
			where: { value: email }
		});
		if (foundDuplicate?.length) {
			form.setFieldError(
				`emails.${index}.value`, 
				EMAILS_CONSTANTS.VALIDATION.FOUND_DUPLICATE_DB
			);
			++index;
			return false;
		}

		form.setFieldError(`emails.${index}.value`, null);
		++index;
	}

	return true;
}
