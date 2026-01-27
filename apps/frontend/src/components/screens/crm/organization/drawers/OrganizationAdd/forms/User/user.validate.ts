import { UserValidateProps, FIELD_NAME_USER } from ".";

export const userValidate = async (
	{ form }: UserValidateProps
): Promise<true | undefined> => {
	const { userId } = form.values.organization;

	// Не указан ответственный
	if (!userId) {
		form.setFieldError(FIELD_NAME_USER, 'Укажите ответственного');
		return;
	}

	return true;
}
