import { ContactsValidateProps, FIELD_NAME_CONTACTS } from ".";

export const contactsValidate = async (
	{ form }: ContactsValidateProps
): Promise<true | undefined>  => {
	const { contacts } = form.values;

	if (!contacts.length) {
		form.setFieldError(
			FIELD_NAME_CONTACTS, 
			'Заполните поле'
		);
		return;
	}

	return true;
}
