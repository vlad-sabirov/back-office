import {
	useCrmContactActions,
	useValidateCrmContactFormName,
	useValidateCrmContactFormWorkPosition,
	useValidateCrmContactFormUserId,
	useValidateCrmContactFormComment,
	useValidateCrmContactFormBirthday,
} from "../../../";
import { useValidateCrmPhonesFormDeprecated } from "@fsd/entities/crm-phone";
import { useValidateCrmEmailsFormDeprecated } from "@fsd/entities/crm-email";
import { useStateSelector } from "@fsd/shared/lib/hooks";

export const useValidate = () => {
	const users = useStateSelector((state) => state.staff.data.sales);
	const contactCurrent = useStateSelector((state) => state.crm_contact.data.current);
	const orgActions = useCrmContactActions();
	const formErrors = useStateSelector((state) => state.crm_contact.forms.update.errors);
	const formValues = useStateSelector((state) => state.crm_contact.forms.update.values);

	const validateName = useValidateCrmContactFormName({
		value: formValues.name,
		error: formErrors?.name,
		onChange: (val) => orgActions.setFormEdit({
			field: 'name',
			value: val,
			error: undefined,
		}),
		onError: (val) => orgActions.setFormEdit({
			field: 'name',
			value: formValues.name,
			error: val,
		}),
		required: true,
	});

	const validateUserId = useValidateCrmContactFormUserId({
		value: formValues.userId,
		error: formErrors?.userId,
		onChange: (val) => orgActions.setFormEdit({
			field: 'userId',
			value: val,
			error: undefined,
		}),
		onError: (val) => orgActions.setFormEdit({
			field: 'userId',
			value: formValues.userId,
			error: val,
		}),
		required: true,
		users,
	});

	const validateWorkPosition = useValidateCrmContactFormWorkPosition({
		value: formValues.workPosition,
		error: formErrors?.workPosition,
		onChange: (val) => orgActions.setFormEdit({
			field: 'workPosition',
			value: val,
			error: undefined,
		}),
		onError: (val) => orgActions.setFormEdit({
			field: 'workPosition',
			value: formValues.workPosition,
			error: val,
		}),
		required: true,
	});

	const validateComment = useValidateCrmContactFormComment({
		value: formValues.comment,
		error: formErrors?.comment,
		onChange: (val) => orgActions.setFormEdit({
			field: 'comment',
			value: val,
			error: undefined,
		}),
		onError: (val) => orgActions.setFormEdit({
			field: 'comment',
			value: formValues.comment,
			error: val,
		}),
	});

	const validateBirthday = useValidateCrmContactFormBirthday({
		value: formValues.birthday,
		error: formErrors?.birthday,
		onChange: (val) => orgActions.setFormEdit({
			field: 'birthday',
			value: val,
			error: undefined,
		}),
		onError: (val) => orgActions.setFormEdit({
			field: 'birthday',
			value: formValues.birthday,
			error: val,
		}),
	});

	const validatePhones = useValidateCrmPhonesFormDeprecated({
		changeField: 'phones',
		value: formValues.phones,
		error: formErrors?.phones,
		onChange: orgActions.setFormCreateField,
		ignorePhones: contactCurrent?.phones?.map((phone) => phone.value),
		required: true,
	});

	const validateEmails = useValidateCrmEmailsFormDeprecated({
		changeField: 'emails',
		value: formValues.emails,
		error: formErrors?.emails,
		ignoreEmails: contactCurrent?.emails?.map((email) => email.value),
		onChange: orgActions.setFormCreateField,
	});

	return  async (): Promise<boolean> => {
		if (!(await validateName())) { return false; }
		if (!(await validateUserId())) { return false; }
		if (!(await validateWorkPosition())) { return false; }
		if (!(await validatePhones())) { return false; }
		if (!(await validateEmails())) { return false; }
		if (!(await validateComment())) { return false; }
		if (!(await validateBirthday())) { return false; }
		return true;
	};
}
