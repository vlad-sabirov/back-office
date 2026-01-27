import { format, parseISO } from "date-fns";
import { WritableDraft } from "immer/dist/internal";
import { ICrmContactReducer } from "../slice.types";

export const setFormEditCurrent = (
	state: WritableDraft<ICrmContactReducer>,
): void => {
	const currentContact = state.data.current;
	if (!currentContact) { return; }
	state.forms.update = {
		values: {
			name: currentContact.name,
			userId: String(currentContact.userId),
			workPosition: currentContact.workPosition,
			comment: currentContact.comment ?? '',

			birthday: currentContact.birthday
				? format(parseISO(currentContact.birthday), 'yyyy-MM-dd')
				: '',

			phones: currentContact.phones?.length
				? currentContact.phones.map((phone) => (
					{ value: phone.value, comment: phone.comment ?? '' }
				))
				: [{ value: '', comment: '' }],

			emails: currentContact.emails?.length
				? currentContact.emails.map((email) => (
					{ value: email.value, comment: email.comment ?? '' }
				))
				: [{ value: '', comment: '' }],
		},
		errors: {},
	};
}
