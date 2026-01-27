import { CrmOrganizationService } from '@services';
import { FIELD_NAME_FIRST_DOCUMENT, FirstDocumentValidateProps } from '.';

export const firstDocumentValidate = async ({ form }: FirstDocumentValidateProps): Promise<true | undefined> => {
	const { firstDocument } = form.values.organization;

	// Пустое поле
	if (!firstDocument.length) {
		form.setFieldError(FIELD_NAME_FIRST_DOCUMENT, 'Укажите расходную накладную');
		return;
	}

	// Не менее трех символов
	if (firstDocument.length <= 3) {
		form.setFieldError(FIELD_NAME_FIRST_DOCUMENT, 'Не менее трех символов');
		return;
	}

	// Проверка на дубликат
	const [findDuplicate] = await CrmOrganizationService.findOnce({
		where: { firstDocument: firstDocument.trim() },
	});
	if (findDuplicate) {
		form.setFieldError(FIELD_NAME_FIRST_DOCUMENT, 'Организация с такой расходной накладной уже существует');
		return;
	}

	return true;
};
