import { FC, useCallback, useMemo } from 'react';
import { TodoFormAssignee, TodoFormDescription, TodoFormDueDate, TodoFormName } from '@fsd/entities/todo';
import { TodoFormDueTime, TodoFormNotificationTelegram, TodoFormOrganizationOrContact } from '@fsd/entities/todo';
import { useTodoActions } from '@fsd/entities/todo';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { HelperValidate } from '@fsd/shared/lib/validate';
import { Button, Modal } from '@fsd/shared/ui-kit';
import { useValidation } from '../../lib';
import { useCreate } from '../../lib/use-create/use-create';
import css from './create-modal.module.scss';

export const CreteModal: FC = () => {
	const isOpen = useStateSelector((state) => state.todo.modals.create);
	const isLoading = useStateSelector((state) => state.todo.isLoading);
	const form = useStateSelector((state) => state.todo.forms.create);
	const formError = useStateSelector((state) => state.todo.formErrors.create);
	const name = useStateSelector((state) => state.todo.forms.create.name);
	const dueTimeStamp = useStateSelector((state) => state.todo.forms.create.dueDate);
	const assigneeId = useStateSelector((state) => state.todo.forms.create.assigneeId);
	const organizationOrContact = useStateSelector((state) => state.todo.forms.create.organizationOrContact);
	const sendNotificationToTelegram = useStateSelector((state) => state.todo.forms.create.sendNotificationToTelegram);
	const description = useStateSelector((state) => state.todo.forms.create.description);
	const createTask = useCreate(form);
	const validation = useValidation();

	const isEmptyErrors = useMemo(() => !HelperValidate.isEmptyObject(formError), [formError]);

	const todoActions = useTodoActions();

	const handleModalClose = useCallback(() => {
		todoActions.setModalShow({ modal: 'create', show: false });
		setTimeout(() => {
			todoActions.clearFormCreate();
			todoActions.clearFormErrorsCreate();
		}, 100);
	}, [todoActions]);

	const handleCreate = useCallback(async () => {
		const isValidate = validation({ form });
		if (!isValidate) {
			return;
		}

		const isSuccessful = await createTask();
		if (isSuccessful) {
			handleModalClose();
		}

		todoActions.updateData('my');
		todoActions.clearFormCreate();
		todoActions.setModalShow({ modal: 'create', show: false });
	}, [createTask, form, handleModalClose, todoActions, validation]);

	return (
		<Modal opened={isOpen} onClose={handleModalClose} title={'Добавление задачи'} size={440} loading={isLoading}>
			<div className={css.form}>
				<TodoFormName
					value={name}
					onChange={(name) => {
						todoActions.setFormCreate({ name });
					}}
					error={formError.name}
					setError={(val: string | null) => todoActions.setFormErrorCreate({ name: val ?? '' })}
					required
				/>

				<TodoFormDueDate
					value={dueTimeStamp}
					onChange={(dueDate) => {
						todoActions.setFormCreate({ dueDate });
					}}
					error={formError.dueDate}
					setError={(val: string | null) => todoActions.setFormErrorCreate({ dueDate: val ?? '' })}
					required
				/>

				<div className={css.buttons}>
					<TodoFormDueTime
						value={dueTimeStamp}
						onChange={(dueDate) => {
							todoActions.setFormCreate({ dueDate });
						}}
						error={formError.dueDate}
						setError={(val: string | null) => todoActions.setFormErrorCreate({ dueDate: val ?? '' })}
					/>

					<TodoFormAssignee
						value={assigneeId}
						onChange={(assigneeId) => {
							todoActions.setFormCreate({ assigneeId });
						}}
						error={formError.assigneeId}
						setError={(val: string | null) => todoActions.setFormErrorCreate({ assigneeId: val ?? '' })}
					/>

					<TodoFormOrganizationOrContact
						value={organizationOrContact}
						onChange={(organizationOrContact) => {
							todoActions.setFormCreate({ organizationOrContact });
						}}
						error={formError.organizationOrContact}
						setError={(val: string | null) =>
							todoActions.setFormErrorCreate({ organizationOrContact: val ?? '' })
						}
					/>
				</div>

				<TodoFormNotificationTelegram
					value={sendNotificationToTelegram}
					onChange={(sendNotificationToTelegram) => {
						todoActions.setFormCreate({ sendNotificationToTelegram });
					}}
					error={formError.sendNotificationToTelegram}
					setError={(val: string | null) =>
						todoActions.setFormErrorCreate({ sendNotificationToTelegram: val ?? '' })
					}
				/>

				<TodoFormDescription
					value={description}
					onChange={(description) => {
						todoActions.setFormCreate({ description });
					}}
					error={formError.description}
					setError={(val: string | null) => todoActions.setFormErrorCreate({ description: val ?? '' })}
				/>
			</div>

			<Modal.Buttons>
				<Button>Отмена</Button>
				<Button color={'primary'} variant={'hard'} onClick={handleCreate} disabled={isEmptyErrors}>
					Добавить
				</Button>
			</Modal.Buttons>
		</Modal>
	);
};
