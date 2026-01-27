import { FC, useState } from 'react';
import { TextField } from '@fsd/shared/ui-kit';
import { ContactsProps, ContactsModalsProps, FIELD_NAME_CONTACTS, ContactItemT } from '.';
import css from './contacts.module.scss';
import cn from 'classnames';
import { ContactPickModal } from '@screens/crm/organization/modals';
import { parsePhoneNumber } from '@helpers';

export const Contacts: FC<ContactsProps> = ({ form, className }) => {
	const [current, setCurrent] = useState<ContactItemT>();
	const [isModalVisible, setIsModalVisible] = useState<ContactsModalsProps>({
		add: false, update: false, delete: false, disconnect: false,
	});

	const handleAddContact = (res: ContactItemT) => {
		form.setFieldValue(FIELD_NAME_CONTACTS, [...form.values[FIELD_NAME_CONTACTS], res]);
	}

	const handleEditContact = (res: ContactItemT) => {
		form.setFieldValue(FIELD_NAME_CONTACTS,
			[...form.values[FIELD_NAME_CONTACTS].filter((item) => item.id !== res.id), res]
		);
	}

	const handleDeleteOrDisconnectContact = (res: ContactItemT) => {
		form.setFieldValue(
			FIELD_NAME_CONTACTS, 
			form.values[FIELD_NAME_CONTACTS].filter((item) => item.id !== res.id)
		);
	}

	return (
		<>
			<div className={cn(css.root, className)}>
				<div>
					<TextField
						mode={'heading'}
						size={'small'}
						className={cn(css.title, {
							[css.title__error]: form.errors[FIELD_NAME_CONTACTS],
						})}
					>
						Контакты
					</TextField>
				</div>

				{form.values[FIELD_NAME_CONTACTS].map((item, index) => (
					<div key={index}>
						<TextField className={css.name}>{item.name}</TextField>
						<TextField className={css.workPosition} size={'small'}>{item.workPosition}</TextField>

						{!!item.phones.length && item.phones.map((phone) => {
							const displayPhone = parsePhoneNumber(phone.value)
							return (
								<TextField key={phone.value} size={'small'} className={css.phone__item}>
									{displayPhone.output} {!!phone.comment.length && <span>{phone.comment}</span>}
								</TextField>
							)
						})}
						{item.type === 'create' && <>
							<div className={css.actions}>
								<TextField
									onClick={() => {
										setCurrent({ ...item, birthday: item.birthday || '' });
										setIsModalVisible(old => ({ ...old, update: true }))
									}}
								> изменить </TextField>

								<TextField
									onClick={() => {
										setCurrent({ ...item, birthday: item.birthday || '' });
										setIsModalVisible(old => ({ ...old, delete: true }))
									}}
								> удалить </TextField>
							</div>
						</>}

						{item.type === 'connect' && <>
							<div className={css.actions}>
							<TextField
								onClick={() => {
									setCurrent({ ...item, birthday: item.birthday || '' });
									setIsModalVisible(old => ({ ...old, disconnect: true }))
								}}
							> открепить </TextField>
							</div>
						</>}
					</div>
				))}
				
				<TextField
					className={css.add}
					onClick={() => setIsModalVisible(old => ({ ...old, add: true }))}
				> Добавить </TextField>
			</div>

			<ContactPickModal
				type={'find'}
				opened={isModalVisible.add}
				setOpened={(val) => { setIsModalVisible(old => ({ ...old, add: val })) }}
				onSuccess={handleAddContact}
				hasContactIds={form.values.contacts.map((contact) => contact.id) ?? []}
				hasPhoneData={[
					...form.values.phones,
					...form.values.contacts
						.filter((contact) => contact.id !== current?.id)
						.map((contact) => contact.phones).flat(),
				]}
				hasEmailData={[
					...form.values.emails,
					...form.values.contacts
						.filter((contact) => contact.id !== current?.id)
						.map((contact) => contact.emails).flat(),
				]}
			/>

			<ContactPickModal
				type={'update'}
				current={current}
				opened={isModalVisible.update}
				setOpened={(val) => { setIsModalVisible(old => ({ ...old, update: val })) }}
				onSuccess={handleEditContact}
				hasContactIds={[]}
				hasPhoneData={[
					...form.values.phones,
					...form.values.contacts
						.filter((contact) => contact.id !== current?.id)
						.map((contact) => contact.phones).flat(),
				]}
				hasEmailData={[
					...form.values.emails,
					...form.values.contacts
						.filter((contact) => contact.id !== current?.id)
						.map((contact) => contact.emails).flat(),
				]}
			/>

			<ContactPickModal
				type={'delete'}
				current={current}
				opened={isModalVisible.delete}
				setOpened={(val) => { setIsModalVisible(old => ({ ...old, delete: val })) }}
				onSuccess={handleDeleteOrDisconnectContact}
				hasContactIds={[]}
				hasPhoneData={[]}
				hasEmailData={[]}
			/>

			<ContactPickModal
				type={'disconnect'}
				current={current}
				opened={isModalVisible.disconnect}
				setOpened={(val) => { setIsModalVisible(old => ({ ...old, disconnect: val })) }}
				onSuccess={handleDeleteOrDisconnectContact}
				hasContactIds={[]}
				hasPhoneData={[]}
				hasEmailData={[]}
			/>
		</>
	);
};
