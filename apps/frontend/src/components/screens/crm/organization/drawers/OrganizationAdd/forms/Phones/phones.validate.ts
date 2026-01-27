import { parsePhoneNumber } from "@helpers";
import { CrmPhoneService } from "@services";
import { PhonesValidateProps, FIELD_NAME_PHONES } from ".";

export const phonesValidate = async (
	{ form }: PhonesValidateProps
): Promise<true | undefined> => {
	const { phones } = form.values;

	let index = 0;
	for (const phone of phones) {
		const parsePhone = parsePhoneNumber(phone.value);
		if (!parsePhone.clear.length) { index++; continue; }
		
		// Неверный формат телефонного номера
		if (!parsePhone.valid || parsePhone.clear.length === 3) {
			form.setFieldError(`${FIELD_NAME_PHONES}.${index}.value`, 'Неверный формат');
			index++;
			continue;
		}

		// Слишком длинный комментарий
		if (phone.comment.length > 42) {
			form.setFieldError(`${FIELD_NAME_PHONES}.${index}.comment`, 'Укоротите комментарий');
			index++;
			continue;
		}

		// Найти дубликаты в массиве телефонов организации
		const phoneArr = [
			...phones.filter((_, i) => i !== index).map(item => parsePhoneNumber(item.value).clear),
			...form.values.contacts.map(contact => {
				return contact.phones.map(phone => parsePhoneNumber(phone.value).clear);
			}).flat(),
		];		
		if (phoneArr.includes(parsePhone.clear)) {
			form.setFieldError(`${FIELD_NAME_PHONES}.${index}.value`, 'Уже используется');
			index++;
			continue;
		}

		// Поиск дубликатов в базе
		const [foundDuplicate] = await CrmPhoneService.findOnce({
			where: { value: parsePhone.clear }
		})
		if (foundDuplicate) {
			form.setFieldError(`${FIELD_NAME_PHONES}.${index}.value`, 'Уже есть в базе');
			index++;
			continue;
		}

		form.setFieldError(`${FIELD_NAME_PHONES}.${index}.value`, undefined);
		index++;
	}

	return true;
}
