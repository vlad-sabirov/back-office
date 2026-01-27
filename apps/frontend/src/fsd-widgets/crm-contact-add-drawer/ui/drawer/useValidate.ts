import { useValidateCrmOrganizationsCardInfo } from "fsd-features/crm-organizations-card-info";
import { 
	useCrmContactActions, 
	useValidateCrmContactFormName, 
	useValidateCrmContactFormWorkPosition,
	useValidateCrmContactFormUserId,
	useValidateCrmContactFormComment,
	useValidateCrmContactFormBirthday,
} from "@fsd/entities/crm-contact";
import { useValidateCrmPhonesFormDeprecated } from "@fsd/entities/crm-phone";
import { useValidateCrmEmailsFormDeprecated } from "@fsd/entities/crm-email";
import { useStateSelector } from "@fsd/shared/lib/hooks";

export const useValidate = () => {
	const users = useStateSelector((state) => state.staff.data.sales);
	const orgActions = useCrmContactActions();
	const formErrors = useStateSelector((state) => state.crm_contact.forms.create.errors);
	const formValues = useStateSelector((state) => state.crm_contact.forms.create.values);

	const validateName = useValidateCrmContactFormName({
		value: formValues.name,
		error: formErrors?.name,
		onChange: (val) => orgActions.setFormCreateField({
			field: 'name',
			value: val,
			error: undefined,
		}),
		onError: (val) => orgActions.setFormCreateField({
			field: 'name',
			value: formValues.name,
			error: val,
		}),
		required: true,
	});

	const validateWorkPosition = useValidateCrmContactFormWorkPosition({
		value: formValues.workPosition,
		error: formErrors?.workPosition,
		onChange: (val) => orgActions.setFormCreateField({
			field: 'workPosition',
			value: val,
			error: undefined,
		}),
		onError: (val) => orgActions.setFormCreateField({
			field: 'workPosition',
			value: formValues.workPosition,
			error: val,
		}),
		required: true,
	});

	const validateUserId = useValidateCrmContactFormUserId({
		value: formValues.userId,
		error: formErrors?.userId,
		onChange: (val) => orgActions.setFormCreateField({
			field: 'userId',
			value: val,
			error: undefined,
		}),
		onError: (val) => orgActions.setFormCreateField({
			field: 'userId',
			value: formValues.userId,
			error: val,
		}),
		required: true,
		users,
	});

	const validateComment = useValidateCrmContactFormComment({
		value: formValues.comment,
		error: formErrors?.comment,
		onChange: (val) => orgActions.setFormCreateField({
			field: 'comment',
			value: val,
			error: undefined,
		}),
		onError: (val) => orgActions.setFormCreateField({
			field: 'comment',
			value: formValues.comment,
			error: val,
		}),
	});

	const validateBirthday = useValidateCrmContactFormBirthday({
		value: formValues.birthday,
		error: formErrors?.birthday,
		onChange: (val) => orgActions.setFormCreateField({
			field: 'birthday',
			value: val,
			error: undefined,
		}),
		onError: (val) => orgActions.setFormCreateField({
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
		required: true,
	});

	const validateEmails = useValidateCrmEmailsFormDeprecated({
		changeField: 'emails',
		value: formValues.emails,
		error: formErrors?.emails,
		onChange: orgActions.setFormCreateField,
	});

	const validateOrganizations = useValidateCrmOrganizationsCardInfo({
		changeField: 'organizations',
		value: formValues.organizations,
		error: formErrors?.organizations,
		onChange: orgActions.setFormCreateField,
	});

	return async (): Promise<boolean> => {
		if (!(await validateName())) { return false; }
		if (!(await validateUserId())) { return false; }
		if (!(await validateWorkPosition())) { return false; }
		if (!(await validatePhones())) { return false; }
		if (!(await validateEmails())) { return false; }
		if (!(await validateComment())) { return false; }
		if (!(await validateBirthday())) { return false; }
		if (!(await validateOrganizations())) { return false; }
		return true;
	};
}
