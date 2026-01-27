import {
	CrmContactFormBirthday, CrmContactFormComment,
	CrmContactFormName,
	CrmContactFormUserId,
	CrmContactFormWorkPosition
} from "@fsd/entities/crm-contact";
import { CrmEmailsForm } from "@fsd/entities/crm-email";
import { CrmPhonesForm } from "@fsd/entities/crm-phone";
import { useStateSelector } from "@fsd/shared/lib/hooks";
import { HelperValidate } from "@fsd/shared/lib/validate";
import { Button, Modal } from "@fsd/shared/ui-kit";
import { FC, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useActions } from "../../lib/use-actions";
import { initialState } from "../../model/slice/contact-card-slice.init";
import { useValidate } from "./lib/use-validate";
import { IUpdateModalProps } from "./update-modal.types";
import css from './update-modal.module.scss';

export const UpdateModal: FC<IUpdateModalProps> = (props) => {
	const { data, dataPhones, dataEmails, onUpdate } = props;
	const current = useStateSelector((state) => state.crm_contact_card_info.current);
	const formErrors = useStateSelector((state) => state.crm_contact_card_info.errors.update);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const isShowModal = useStateSelector((state) => state.crm_contact_card_info.modals.update);
	const users = useStateSelector((state) => state.staff.data.sales);
	const actions = useActions();
	const validate = useValidate({ data, dataPhones, dataEmails });
	const hasError = useMemo(() => !HelperValidate.isEmptyObject(formErrors), [formErrors]);

	const name = useStateSelector((state) => state.crm_contact_card_info.forms.update.name);
	const nameErr = useStateSelector((state) => state.crm_contact_card_info.errors.update.name);
	const workPosition = useStateSelector((state) => state.crm_contact_card_info.forms.update.workPosition);
	const workPositionErr = useStateSelector((state) => state.crm_contact_card_info.errors.update.workPosition);
	const phones = useStateSelector((state) => state.crm_contact_card_info.forms.update.phones);
	const phonesErr = useStateSelector((state) => state.crm_contact_card_info.errors.update.phones);
	const emails = useStateSelector((state) => state.crm_contact_card_info.forms.update.emails);
	const emailsErr = useStateSelector((state) => state.crm_contact_card_info.errors.update.emails);
	const birthday = useStateSelector((state) => state.crm_contact_card_info.forms.update.birthday);
	const birthdayErr = useStateSelector((state) => state.crm_contact_card_info.errors.update.birthday);
	const userId = useStateSelector((state) => state.crm_contact_card_info.forms.update.userId);
	const userIdErr = useStateSelector((state) => state.crm_contact_card_info.errors.update.userId);
	const comment = useStateSelector((state) => state.crm_contact_card_info.forms.update.comment);
	const commentErr = useStateSelector((state) => state.crm_contact_card_info.errors.update.comment);

	const handleModalClose = useCallback(() => {
		actions.setModal(['update', false]);
	}, [actions]);

	const handleSave = useCallback(async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!onUpdate) { return; }
		setIsLoading(true);

		if (!(await validate())) {
			setIsLoading(false);
			return;
		}

		onUpdate({
			id: current?.id ?? 0,
			type: current?.type ?? 'create',
			name: name,
			workPosition: workPosition,
			phones: phones.filter((phone) => phone.value !== ''),
			emails: emails.filter((email) => email.value !== ''),
			birthday: birthday,
			userId: Number(userId),
			comment: comment,
		});
		handleModalClose();
		setIsLoading(false);
	}, [
		birthday, comment, current?.id, current?.type, emails, handleModalClose,
		name, onUpdate, phones, userId, validate, workPosition
	]);

	useEffect(() => {
		if (!current || !isShowModal) { return; }
		actions.setUpdateError(initialState.errors.update);
		actions.setUpdateForm({
			name: current.name,
			workPosition: current.workPosition,
			phones: current.phones.length ? current.phones : [{ value: '', comment: '' }],
			emails: current.emails.length ? current.emails : [{ value: '', comment: '' }],
			birthday: current.birthday,
			userId: String(current.userId),
			comment: current.comment,
		});
	}, [actions, current, isShowModal]);

	return (
		<Modal
			title={'Изменение контакта'}
			size={600}
			opened={isShowModal}
			onClose={handleModalClose}
			loading={isLoading}
		>
			<form onSubmit={handleSave}>
				<div className={css.form}>
					<CrmContactFormName
						value={name}
						error={nameErr}
						onChange={(name) => actions.setUpdateForm({ name })}
						onError={(name) => actions.setUpdateError({ name })}
						className={css.name}
						required
					/>

					<CrmContactFormWorkPosition
						value={workPosition}
						error={workPositionErr}
						onChange={(workPosition) => actions.setUpdateForm({ workPosition })}
						onError={(workPosition) => actions.setUpdateError({ workPosition })}
						className={css.workPosition}
						required
					/>

					<CrmPhonesForm
						value={phones}
						error={phonesErr}
						data={[...data.flatMap((item) => item.phones), ...dataPhones ?? []]}
						ignorePhones={current?.phones?.map((item) => item.value) ?? []}
						onChange={(phones) => actions.setUpdateForm({ phones })}
						onError={(phones) => actions.setUpdateError({ phones })}
						className={css.phones}
						required
					/>

					<CrmEmailsForm
						value={emails}
						error={emailsErr}
						data={[...data.flatMap((item) => item.emails), ...dataEmails ?? []]}
						ignoreEmails={current?.emails?.map((item) => item.value) ?? []}
						onChange={(emails) => actions.setUpdateForm({ emails })}
						onError={(emails) => actions.setUpdateError({ emails })}
						className={css.emails}
					/>

					<CrmContactFormBirthday
						value={birthday}
						error={birthdayErr}
						onChange={(birthday) => actions.setUpdateForm({ birthday })}
						onError={(birthday) => actions.setUpdateError({ birthday })}
						className={css.birthday}
					/>

					<CrmContactFormUserId
						value={userId}
						error={userIdErr}
						onChange={(userId) => actions.setUpdateForm({ userId })}
						onError={(userId) => actions.setUpdateError({ userId })}
						users={users}
						className={css.userId}
						required
					/>

					<CrmContactFormComment
						value={comment}
						error={commentErr}
						onChange={(comment) => actions.setUpdateForm({ comment })}
						onError={(comment) => actions.setUpdateError({ comment })}
						className={css.comment}
					/>
				</div>

				<Modal.Buttons>
					<Button
						onClick={handleModalClose}
					> Отмена </Button>

					<Button
						type={'submit'}
						color={'primary'}
						variant={'hard'}
						disabled={hasError}
					> Сохранить </Button>
				</Modal.Buttons>
			</form>
		</Modal>
	);
}
