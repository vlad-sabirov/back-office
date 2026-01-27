import { RequisitesValidateProps, FIELD_NAME_REQUISITES } from ".";

export const requisitesValidate = async (
	{ form }: RequisitesValidateProps
): Promise<true | undefined>  => {
	const { requisites } = form.values;

	if (!requisites.length) {
		form.setFieldError(
			FIELD_NAME_REQUISITES, 
			'Заполните поле'
		);
		return;
	}

	return true;
}
