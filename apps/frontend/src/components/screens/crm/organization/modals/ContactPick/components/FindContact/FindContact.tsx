import { FC, useCallback, useContext, useEffect, useState } from 'react';
import * as Types from './find-contact.types';
import * as Form from './forms';
import { isEmpty } from 'lodash';
import { StoreContext } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { CrmContactResponse } from '@interfaces/crm';
import { useForm } from '@mantine/form';
import { CrmContactService, CrmPhoneService } from '@services';
import css from './find-contact.module.scss';

export const FindContact: FC<Types.FindContactT> = ({
	hasContactIds,
	setFoundContacts,
	setTitle,
	setModalVisible,
	...props
}) => {
	const [isEmptyForm, setIsEmptyForm] = useState<boolean>(true);
	const Store = useContext(StoreContext);
	const { team } = useUserDeprecated();
	const form = useForm<Types.FormValuesT>({ initialValues: { name: '', phone: '' } });

	const handleModalClose = () => {
		setModalVisible(false);
		form.reset();
	};

	const handleFormValidate = useCallback(async () => await Form.validateAll({ form }), [form]);
	const handleFormSubmit = useCallback(async () => {
		const { name, phone } = form.values;
		const foundContacts: CrmContactResponse[] = [];

		if (name.length > 0) {
			const [found] = await CrmContactService.searchByNameDEPRECATED({
				query: name,
				ignoreIds: hasContactIds,
				userIds: team ?? undefined,
				include: { phones: true },
			});
			if (found && found.length > 0) foundContacts.push(...found);
		}

		if (phone.length > 0) {
			const [foundPhone] = await CrmPhoneService.findMany({
				where: { value: phone, type: 'contact' },
			});
			if (foundPhone && foundPhone.length > 0) {
				const [found] = await CrmContactService.findMany({
					where: { OR: foundPhone.map((phone) => ({ id: phone.contactId })) },
					include: { phones: true },
				});
				const filteredFound = found?.filter(
					({ id, userId, isVerified }) =>
						userId && team?.includes(userId) && isVerified && !hasContactIds.includes(String(id))
				);
				if (filteredFound && filteredFound.length > 0) foundContacts.push(...filteredFound);
			}
		}

		setFoundContacts(foundContacts);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.values, setFoundContacts, team]);

	useEffect(() => {
		setTitle('Поиск контакта');
		Store.setConfig({
			buttons: {
				cancel: { event: handleModalClose },
				next: {
					name: isEmptyForm ? 'Пропустить' : 'Найти',
					validate: handleFormValidate,
					event: handleFormSubmit,
				},
			},
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [Store, isEmptyForm, handleFormValidate, handleFormSubmit]);

	useEffect(() => {
		if (!isEmpty(form.errors)) Store.setDisabled(true);
		if (Store.disabled && isEmpty(form.errors)) Store.setDisabled(false);
	}, [Store, form.errors]);

	useEffect(() => {
		if (form.values.name.length > 0 || form.values.phone.length > 0) {
			setIsEmptyForm(false);
			return;
		}
		setIsEmptyForm(true);
	}, [form.values]);

	return (
		<div {...props}>
			<form className={css.form}>
				<Form.Name form={form} />
				<Form.Phone form={form} />
			</form>
		</div>
	);
};
