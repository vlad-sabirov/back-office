import { useForm } from '@mantine/form';
import { Button, StoreContext } from '@fsd/shared/ui-kit';
import { FC, useCallback, useContext, useEffect } from 'react';
import * as Types from './mutation-contact.types';
import * as Forms from './forms';
import css from './mutation-contact.module.scss';
import { isEmpty, trim } from 'lodash';

export const MutationContact: FC<Types.MutationContactT> = (
	{ type, current, hasPhoneData, hasEmailData, onSuccess, setModalVisible, setTitle, ...props }
) => {
	const Store = useContext(StoreContext);
	const form = useForm<Types.FormValuesT>({initialValues: {
		name: '',
		workPosition: '',
		phones: [{ value: '', comment: '' }],
		emails: [{ value: '', comment: '' }],
		birthday: '',
		comment: '',
	}});

	const handleModalClose = () => {
		setModalVisible(false);
	}

	const handleValidate = useCallback(async () => {
		return await Forms.validateAll({ form, hasPhoneData, hasEmailData });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.values, hasEmailData, hasPhoneData]);

	const handleCreate = useCallback(async () => {		
		onSuccess({
			id: new Date().getTime().toString(),
			type: 'create',
			name: form.values.name,
			workPosition: form.values.workPosition,
			phones: form.values.phones.filter((phone) => trim(phone.value).length > 0),
			emails: form.values.emails.filter((email) => trim(email.value).length > 0),
			birthday: form.values.birthday,
			comment: form.values.comment,
		});
		handleModalClose();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.values]);

	const handleUpdate = useCallback(async () => {
		if (!current) return;
		handleValidate();
		onSuccess({
			id: current.id,
			type: 'create',
			name: form.values.name,
			workPosition: form.values.workPosition,
			phones: form.values.phones.filter((phone) => trim(phone.value).length > 0),
			emails: form.values.emails.filter((email) => trim(email.value).length > 0),
			birthday: form.values.birthday,
			comment: form.values.comment,
		});
		handleModalClose();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.values, current]);
	
	useEffect(() => {
		if (type === 'create') {
			setTitle('Добавление контакта');
			Store.setConfig({
				buttons: {
					finish: {
						name: 'Добавить',
						validate: handleValidate,
						event: handleCreate,
					},
				}
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [Store, handleCreate, handleValidate, setTitle, type]);

	useEffect(() => {		
		if (!isEmpty(form.errors)) Store.setDisabled(true);
		if (Store.disabled && isEmpty(form.errors)) Store.setDisabled(false);
	}, [Store, form.errors]);

	useEffect(() => {
		if (type === 'update' && current) {
			form.setValues({
				name: current.name,
				workPosition: current.workPosition,
				birthday: current.birthday,
				comment: current.comment,
				phones: current.phones.length ? current.phones : [{ value: '', comment: '' }],
				emails: current.emails.length ? current.emails : [{ value: '', comment: '' }],
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [current])

	return (
		<div className={css.form} {...props}>
			<Forms.Name form={form} />
			<Forms.WorkPosition form={form} />
			<Forms.Phones form={form} hasPhoneData={hasPhoneData} />
			<Forms.Emails form={form} hasEmailData={hasEmailData} />
			<Forms.Birthday form={form} />
			<Forms.Comment form={form} />

			{type === 'update' && (
				<div className={css.buttons}>
					<Button
						onClick={handleModalClose}
						disabled={Store.disabled}
					> Отмена </Button>
					
					<Button
						color={'success'}
						variant={'hard'}
						onClick={handleUpdate}
						disabled={Store.disabled}
					> Сохранить </Button>
				</div>
			)}
		</div>
	);
};
