import { FC, useCallback, useState } from "react";
import { useStateSelector } from "@fsd/shared/lib/hooks";
import { Button, Modal } from "@fsd/shared/ui-kit";
import { CrmEmailsFormDeprecated } from "@fsd/entities/crm-email";
import { useCrmContactActions } from "../..";
import { FormName } from "../form-name/FormName";
import { FormUserId } from "../form-user-id/FormUserId";
import { IModalEditProps } from "./modal-edit.types";
import { useValidate } from "./lib/useValidate";
import { WorkPosition } from "../form-work-position/WorkPosition";
import { CrmPhonesFormDeprecated } from "@fsd/entities/crm-phone";
import { FormBirthday } from "../form-birthday/FormBirthday";
import { FormComment } from "../form-comment/FormComment";
import { useEdit } from "./lib/useEdit";
import css from './modal-edit.module.scss';

export const ModalEdit: FC<IModalEditProps> = (
	{ isShow, setIsShow, onSuccess }
) => {
	const currentContact = useStateSelector((state) => state.crm_contact.data.current);
	const fromEdit = useStateSelector((state) => state.crm_contact.forms.update);
	const orgActions = useCrmContactActions();
	const users = useStateSelector((state) => state.staff.data.sales);
	const isValidate = useValidate();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const updateContact = useEdit();

	const handleClose = useCallback(() => {
		setIsShow(false);
	}, [setIsShow]);

	const handleSave = useCallback(async () => {
		setIsLoading(true);
		if (!(await isValidate())) { return; }
		if (!(await updateContact())) { return; }
		onSuccess();
		setIsLoading(false);
	}, [isValidate, onSuccess, updateContact]);

	return (
		<Modal 
			title={'Изменение контакта'} 
			opened={isShow} 
			onClose={handleClose}
			size={480}
			loading={isLoading}
		>
			<div className={css.wrapper}>
				<FormName
					value={fromEdit.values?.name}
					error={fromEdit.errors?.name}
					onChange={(val) => orgActions.setFormEdit({
						field: 'name',
						value: val,
						error: undefined,
					})}
					onError={(val) => orgActions.setFormEdit({
						field: 'name',
						value: fromEdit.values.name,
						error: val,
					})}
					required
				/>

				<FormUserId
					value={String(fromEdit.values?.userId ?? 1)}
					error={fromEdit.errors?.userId}
					users={users}
					onChange={(val) => orgActions.setFormEdit({
						field: 'userId',
						value: val,
						error: undefined,
					})}
					onError={(val) => orgActions.setFormEdit({
						field: 'userId',
						value: fromEdit.values.userId,
						error: val,
					})}
					required
				/>

				<WorkPosition 
					value={fromEdit.values.workPosition}
					error={fromEdit.errors?.workPosition} 
					onChange={(val) => orgActions.setFormEdit({
						field: 'workPosition',
						value: val,
						error: undefined,
					})}
					onError={(val) => orgActions.setFormEdit({
						field: 'workPosition',
						value: fromEdit.values.workPosition,
						error: val,
					})}
					required
				/>

				<CrmPhonesFormDeprecated
					changeField={'phones'} 
					value={fromEdit.values.phones} 
					ignorePhones={currentContact?.phones?.map((phone) => phone.value)} 
					error={fromEdit.errors?.phones} 
					onChange={orgActions.setFormEdit}
					required
				/>

				<CrmEmailsFormDeprecated
					changeField={'emails'} 
					value={fromEdit.values.emails} 
					ignoreEmails={currentContact?.emails?.map((email) => email.value)} 
					error={fromEdit.errors?.emails} 
					onChange={orgActions.setFormEdit}
				/>

				<FormBirthday
					value={fromEdit.values.birthday}
					error={fromEdit.errors?.birthday} 
					onChange={(val) => orgActions.setFormEdit({
						field: 'birthday',
						value: val,
						error: undefined,
					})}
					onError={(val) => orgActions.setFormEdit({
						field: 'birthday',
						value: fromEdit.values.birthday,
						error: val,
					})}
				/>

				<FormComment
					value={fromEdit.values.comment}
					error={fromEdit.errors?.comment} 
					onChange={(val) => orgActions.setFormEdit({
						field: 'comment',
						value: val,
						error: undefined,
					})}
					onError={(val) => orgActions.setFormEdit({
						field: 'comment',
						value: fromEdit.values.comment,
						error: val,
					})}
				/>
			</div>

			<Modal.Buttons>
				<Button onClick={handleClose}> Отмена </Button>

				<Button
					color={'primary'}
					variant={'hard'}
					onClick={handleSave}
					disabled={isLoading || JSON.stringify({}) != JSON.stringify(fromEdit.errors)}
				> Сохранить </Button>
			</Modal.Buttons>
		</Modal>
	);
}
