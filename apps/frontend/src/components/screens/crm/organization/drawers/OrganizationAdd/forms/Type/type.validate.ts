import { TypeValidateProps, FIELD_NAME_TYPE } from ".";

export const typeValidate = async (
	{ form }: TypeValidateProps
): Promise<true | undefined> => {
	const { typeId } = form.values.organization;

	if (!typeId) {
		form.setFieldError(FIELD_NAME_TYPE, 'Укажите тип организации');
		return;
	}

	return true;
}
