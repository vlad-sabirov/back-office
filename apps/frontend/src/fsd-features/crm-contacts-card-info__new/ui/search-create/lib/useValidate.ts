import { useStateSelector } from "@fsd/shared/lib/hooks";
import { useActions } from "../../../lib/use-actions";

import {
	useValidateCrmContactFormName,
	useValidateCrmContactFormWorkPosition,
	useValidateCrmContactFormBirthday,
	useValidateCrmContactFormUserId,
	useValidateCrmContactFormComment,
} from "@fsd/entities/crm-contact";
import { useValidateCrmPhonesForm } from "@fsd/entities/crm-phone/";
import { useValidateCrmEmailsForm } from "@fsd/entities/crm-email/";

import { IContactCardProps } from "../../contact-card/contact-card.types";


export const useValidate = (
	{ data, dataPhones, dataEmails }: Pick<IContactCardProps, 'data' | 'dataPhones' | 'dataEmails'>
) => {
	const users = useStateSelector((state) => state.staff.data.sales);
	const actions = useActions();
	const formValues = useStateSelector((state) => state.crm_contact_card_info.forms.create);
	const formErrors = useStateSelector((state) => state.crm_contact_card_info.errors.create);

	const validateName = useValidateCrmContactFormName({
		value: formValues.name,
		error: formErrors?.name,
		onChange: (name) => actions.setCreateForm({ name }),
		onError: (name) => actions.setCreateError({ name }),
		required: true,
	});

	const validateWorkPosition = useValidateCrmContactFormWorkPosition({
		value: formValues.workPosition,
		error: formErrors?.workPosition,
		onChange: (workPosition) => actions.setCreateForm({ workPosition }),
		onError: (workPosition) => actions.setCreateError({ workPosition }),
		required: true,
	});

	const validatePhones = useValidateCrmPhonesForm({
		value: formValues.phones,
		error: formErrors?.phones,
		onChange: (phones) => actions.setCreateForm({ phones }),
		onError: (phones) => actions.setCreateError({ phones }),
		ignorePhones: formValues.phones.map((phone) => phone.value),
		data: [...data.flatMap((item) => item.phones), ...dataPhones ?? []],
		required: true,
	});

	const validateEmails = useValidateCrmEmailsForm({
		value: formValues.emails,
		error: formErrors?.emails,
		onChange: (emails) => actions.setCreateForm({ emails }),
		onError: (emails) => actions.setCreateError({ emails }),
		data: [...data.flatMap((item) => item.emails), ...dataEmails ?? []],
		ignoreEmails: formValues.emails.map((email) => email.value),
	});

	const validateBirthday = useValidateCrmContactFormBirthday({
		value: formValues.birthday,
		error: formErrors?.birthday,
		onChange: (birthday) => actions.setCreateForm({ birthday }),
		onError: (birthday) => actions.setCreateError({ birthday }),
	});

	const validateUserId = useValidateCrmContactFormUserId({
		value: formValues.userId,
		error: formErrors?.userId,
		users: users,
		onChange: (userId) => actions.setCreateForm({ userId }),
		onError: (userId) => actions.setCreateError({ userId }),
		required: true,
	});

	const validateComment = useValidateCrmContactFormComment({
		value: formValues.comment,
		error: formErrors?.comment,
		onChange: (comment) => actions.setCreateForm({ comment }),
		onError: (comment) => actions.setCreateError({ comment }),
	});

	return async (): Promise<boolean> => {
		if (!(await validateName())) { return false; }
		if (!(await validateWorkPosition())) { return false; }
		if (!(await validatePhones())) { return false; }
		if (!(await validateEmails())) { return false; }
		if (!(await validateBirthday())) { return false; }
		if (!(await validateUserId())) { return false; }
		if (!(await validateComment())) { return false; }
		return true;
	};
}
