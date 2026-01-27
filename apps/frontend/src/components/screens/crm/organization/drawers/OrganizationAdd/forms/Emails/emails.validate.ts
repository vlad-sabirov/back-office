import { EmailsValidateProps, FIELD_NAME_EMAILS } from ".";
import { parseEmail } from "@helpers";
import { CrmEmailService } from "@services";

export const emailsValidate = async (
	{ form }: EmailsValidateProps
): Promise<true | undefined> => {
	const { emails } = form.values;

	let index = 0;
	for (const email of emails) {
		const parsedEmail = parseEmail(email.value);
		if (!parsedEmail.clear.length) { index++; continue; }
		
		// Неверный формат почтового адреса
		if (!parsedEmail.valid || parsedEmail.clear.length === 3) {
			form.setFieldError(`${FIELD_NAME_EMAILS}.${index}.value`, 'Неверный формат');
			index++;
			continue;
		}

		// Слишком длинный комментарий
		if (email.comment.length > 42) {
			form.setFieldError(`${FIELD_NAME_EMAILS}.${index}.comment`, 'Укоротите комментарий');
			index++;
			continue;
		}

		// Найти дубликаты в массиве почтовых ящиков организации
		const emailArr = [
			...emails.filter((_, i) => i !== index).map(item => parseEmail(item.value).clear),
			...form.values.contacts.map(contact => {
				return contact.emails.map(email => parseEmail(email.value).clear);
			}).flat(),
		];		
		if (emailArr.includes(parsedEmail.clear)) {
			form.setFieldError(`${FIELD_NAME_EMAILS}.${index}.value`, 'Уже используется');
			index++;
			continue;
		}

		// Поиск дубликатов в базе
		const [foundDuplicate] = await CrmEmailService.findOnce({
			where: { value: parsedEmail.clear }
		})
		if (foundDuplicate) {
			form.setFieldError(`${FIELD_NAME_EMAILS}.${index}.value`, 'Уже есть в базе');
			index++;
			continue;
		}

		form.setFieldError(`${FIELD_NAME_EMAILS}.${index}.value`, undefined);
		index++;
	}

	return true;
}
