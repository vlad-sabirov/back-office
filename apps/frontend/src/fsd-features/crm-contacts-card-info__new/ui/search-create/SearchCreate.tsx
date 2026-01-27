import { FC, useCallback, useMemo } from "react";
import { ICrmContactFormEntity } from "@fsd/entities/crm-contact/entity";
import { useStateSelector } from "@fsd/shared/lib/hooks";
import { HelperValidate } from "@fsd/shared/lib/validate";
import { Button, Modal } from "@fsd/shared/ui-kit";
import { useActions } from "../../lib/use-actions";
import { initialState } from "../../model/slice/contact-card-slice.init";
import { useValidate } from "./lib/useValidate";
import { ISearchCreateProps } from "./search-create.types";
import { Form } from "./ui/form/Form";

export const SearchCreate: FC<ISearchCreateProps> = (props) => {
	const { data, dataPhones, dataEmails, onCreate, onClose } = props;
	const actions = useActions();
	const formErrors = useStateSelector((state) => state.crm_contact_card_info.errors.create);
	const validate = useValidate({ data, dataPhones, dataEmails });
	const hasError = useMemo(() => !HelperValidate.isEmptyObject(formErrors), [formErrors]);

	const {
		name,
		workPosition,
		birthday,
		comment,
		phones,
		emails,
		userId,
	} = useStateSelector((state) => state.crm_contact_card_info.forms.create);

	const handleBack = useCallback(() => {
		actions.setSearchStep('search');
		actions.setCreateForm(initialState.forms.create);
		actions.setCreateError(initialState.errors.create);
	}, [actions]);

	const handleCreate = useCallback(async () => {
		if (!(await validate())) { return; }

		const val: ICrmContactFormEntity = {
			id: new Date().getTime(),
			type: 'create',
			name, workPosition, birthday, comment,
			userId: Number(userId),
			phones: phones.filter((val) => val.value.trim()),
			emails: emails.filter((val) => val.value.trim()),
		};
		onCreate?.(val);
		onClose();
	}, [birthday, comment, emails, name, onClose, onCreate, phones, userId, validate, workPosition]);

	return (
		<div>
			<Form
				data={data}
				dataPhones={dataPhones}
				dataEmails={dataEmails}
			/>

			<Modal.Buttons>
				<Button
					onClick={handleBack}
				> Назад </Button>

				<Button
					color={'primary'}
					variant={'hard'}
					onClick={handleCreate}
					disabled={hasError}
				> Добавить контакт </Button>
			</Modal.Buttons>
		</div>
	);
}
