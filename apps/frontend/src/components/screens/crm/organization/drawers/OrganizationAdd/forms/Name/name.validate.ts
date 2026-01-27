import { CrmOrganizationService } from "@services";
import { NameValidateProps, FIELD_NAME_NAME } from ".";

export const nameValidate = async (
	{ form }: NameValidateProps
): Promise<true | undefined> => {
	const { name } = form.values.organization;

	// Пустое поле
	if (!name.length) {
		form.setFieldError(FIELD_NAME_NAME, 'Укажите название организации');
		return;
	}

	// Не менее трех символов
	if (name.length <= 3) {
		form.setFieldError(FIELD_NAME_NAME, 'Не менее трех символов');
		return;
	}

	// Проверка на дубликат
	const [findDuplicate] = await CrmOrganizationService.findOnce({
		where: { name: name.trim() }
	})
	if (findDuplicate) {
		form.setFieldError(FIELD_NAME_NAME, 'Организация с таким названием уже существует');
		return;
	}
	
	return true;
}
