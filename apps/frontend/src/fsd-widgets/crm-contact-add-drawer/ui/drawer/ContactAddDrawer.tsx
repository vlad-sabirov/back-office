import { FC, useCallback } from "react";
import { showNotification } from "@mantine/notifications";

import { CrmOrganizationsCardInfo } from "fsd-features/crm-organizations-card-info";
import {
	CrmContactFormBirthday,
	CrmContactFormComment,
	CrmContactFormName,
	CrmContactFormUserId, CrmContactFormWorkPosition,
	useCrmContactActions
} from "@fsd/entities/crm-contact";
import { CrmPhonesFormDeprecated } from "@fsd/entities/crm-phone";
import { CrmEmailsFormDeprecated } from "@fsd/entities/crm-email";
import { useStateSelector } from "@fsd/shared/lib/hooks";
import { Button, Drawer } from "@fsd/shared/ui-kit";

import { IContactAddProps } from './contact-add.types';
import css from './contact-add.module.scss';
import { useValidate } from "./useValidate";
import { useAdd } from "./useAdd";

export const ContactAddDrawer: FC<IContactAddProps> = (
	{ loading }
) => {
	const open = useStateSelector((state) => state.crm_contact.modals.search);
	const orgActions = useCrmContactActions();
	const formValues = useStateSelector((state) => state.crm_contact.forms.create.values);
	const formErrors = useStateSelector((state) => state.crm_contact.forms.create.errors);
	const users = useStateSelector((state) => state.staff.data.sales);
	const isValidate = useValidate();
	const add = useAdd(formValues);

	const handleClose = useCallback(() => {
		orgActions.setModalShow({ modal: 'search', show: false });
		orgActions.setFormCreateReset();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [orgActions]);

	const handleSubmit = useCallback(async () => {
		if (!(await isValidate())) { return; }
		if (!(await add())) { return; }
		showNotification({
			color: 'green',
			message: 'Контакт добавлен',
		});
		handleClose();
	}, [isValidate, add, handleClose]);

	return (
		<Drawer
		title={'Добавление контакта'}
		width={480}
		opened={open}
		onClose={handleClose}
		loading={loading}
		position={'left'}
		>
			<div className={css.mainForm}>
				<CrmContactFormName 
					value={formValues.name} 
					error={formErrors?.name} 
					onChange={(val) => orgActions.setFormCreateField({
						field: 'name',
						value: val,
						error: undefined,
					})}
					onError={(val) => orgActions.setFormCreateField({
						field: 'name',
						value: formValues.name,
						error: val,
					})}
					required
				/>

				<CrmContactFormUserId
					value={formValues.userId} 
					error={formErrors?.userId}
					users={users}
					onChange={(val) => orgActions.setFormCreateField({
						field: 'userId',
						value: val,
						error: undefined,
					})}
					onError={(val) => orgActions.setFormCreateField({
						field: 'userId',
						value: formValues.userId,
						error: val,
					})}
					required
				/>

				<CrmContactFormWorkPosition
					value={formValues.workPosition} 
					error={formErrors?.workPosition} 
					onChange={(val) => orgActions.setFormCreateField({
						field: 'workPosition',
						value: val,
						error: undefined,
					})}
					onError={(val) => orgActions.setFormCreateField({
						field: 'workPosition',
						value: formValues.workPosition,
						error: val,
					})}
					required
				/>

				<CrmPhonesFormDeprecated
					value={formValues.phones} 
					error={formErrors?.phones} 
					changeField={'phones'} 
					onChange={orgActions.setFormCreateField}
					required
				/>

				<CrmEmailsFormDeprecated
					value={formValues.emails} 
					error={formErrors?.emails} 
					changeField={'emails'} 
					onChange={orgActions.setFormCreateField}
				/>

				<CrmContactFormBirthday 
					value={formValues.birthday} 
					error={formErrors?.birthday} 
					onChange={(val) => orgActions.setFormCreateField({
						field: 'birthday',
						value: val,
						error: undefined,
					})}
					onError={(val) => orgActions.setFormCreateField({
						field: 'birthday',
						value: formValues.birthday,
						error: val,
					})}
				/>
			</div>

			<CrmOrganizationsCardInfo
				value={formValues.organizations} 
				error={formErrors?.organizations} 
				changeField={'organizations'} 
				onChange={orgActions.setFormCreateField}
				isAdd
				isConnect
			/>

			<div className={css.commentForm}>
				<CrmContactFormComment
					value={formValues.comment} 
					error={formErrors?.comment} 
					onChange={(val) => orgActions.setFormCreateField({
						field: 'comment',
						value: val,
						error: undefined,
					})}
					onError={(val) => orgActions.setFormCreateField({
						field: 'comment',
						value: formValues.comment,
						error: val,
					})}
				/>
			</div>
			
			<div className={css.buttons}>
				<Button
					onClick={handleClose}
				> Отмена </Button>

				<Button
					color={'primary'}
					variant={'hard'}
					onClick={handleSubmit}
					disabled={loading || JSON.stringify({}) != JSON.stringify(formErrors)}
				> Сохранить </Button>
			</div>
		</Drawer>
	);
}
