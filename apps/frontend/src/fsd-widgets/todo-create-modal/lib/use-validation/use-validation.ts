import { IUseValidationProps } from './use-validation.types';
import {
	useTodoActions,
	useTodoFormAssigneeValidation,
	useTodoFormDescriptionValidation,
	useTodoFormDueDateValidation,
	useTodoFormDueTimeValidation,
	useTodoFormNameValidation,
	useTodoFormNotifValidation,
	useTodoFormOrgOrContValidation,
} from '@fsd/entities/todo';

export const useValidation = () => {
	const todoActions = useTodoActions();

	const nameValidation = useTodoFormNameValidation();
	const dateDueValidation = useTodoFormDueDateValidation();
	const timeDueValidation = useTodoFormDueTimeValidation();
	const assigneeValidation = useTodoFormAssigneeValidation();
	const orgOrContValidation = useTodoFormOrgOrContValidation();
	const notifValidation = useTodoFormNotifValidation();
	const descriptionValidation = useTodoFormDescriptionValidation();

	return (opts: IUseValidationProps) => {
		const { form } = opts;

		if (
			!nameValidation({
				value: form.name,
				required: true,
				setError: (val: string | null) => {
					todoActions.setFormErrorCreate({ name: val ?? '' });
				},
			}) ||
			!dateDueValidation({
				value: form.dueDate,
				required: true,
				setError: (val: string | null) => {
					todoActions.setFormErrorCreate({ dueDate: val ?? '' });
				},
			}) ||
			!timeDueValidation({
				value: form.dueDate,
				required: false,
				setError: (val: string | null) => {
					todoActions.setFormErrorCreate({ dueDate: val ?? '' });
				},
			}) ||
			!assigneeValidation({
				value: form.assigneeId,
				required: false,
				setError: (val: string | null) => {
					todoActions.setFormErrorCreate({ assigneeId: val ?? '' });
				},
			}) ||
			!orgOrContValidation({
				value: form.organizationOrContact,
				required: false,
				setError: (val: string | null) => {
					todoActions.setFormErrorCreate({ organizationOrContact: val ?? '' });
				},
			}) ||
			!notifValidation({
				value: form.sendNotificationToTelegram,
				required: false,
				setError: (val: string | null) => {
					todoActions.setFormErrorCreate({ sendNotificationToTelegram: val ?? '' });
				},
			}) ||
			!descriptionValidation({
				value: form.description,
				required: false,
				setError: (val: string | null) => {
					todoActions.setFormErrorCreate({ description: val ?? '' });
				},
			})
		) {
			return false;
		}

		return true;
	};
};
