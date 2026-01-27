import { DateSuffix } from '@helpers';
import { CrmContactResponse } from '@interfaces/crm';
import { ContactItemT } from '@screens/crm/organization/drawers/OrganizationAdd/forms';
import { TextField } from '@fsd/shared/ui-kit';
import { StoreContext } from '@fsd/shared/ui-kit/stepper';
import { FC, useCallback, useContext, useEffect } from 'react';
import { ConnectContactT } from '.';
import { ContactCard } from './components';
import css from './connect-contact.module.scss';

export const ConnectContact: FC<ConnectContactT> = (
	{ contactsFound, setFoundContacts, onSuccess, setModalVisible, setTitle, ...props }
) => {
	const Store = useContext(StoreContext);

	const handleAddNewContact = useCallback(() => {
		setFoundContacts([]);
		Store.setLoading(false);
	}, [Store, setFoundContacts]);

	const handleConnect = useCallback((contact: CrmContactResponse) => {
		const connectDto: ContactItemT = {
			id: String(contact.id),
			type: 'connect',
			name: contact.name,
			workPosition: contact.workPosition,
			emails: [],
			birthday: '',
			comment: '',
			phones: contact.phones?.map(phone => ({
				value: phone.value || '',
				comment: phone.comment || '',
			})) ?? [],
		}
		onSuccess(connectDto);
		setModalVisible(false);
	}, [onSuccess, setModalVisible])

	useEffect(() => {
		setTitle('Прикрепление контакта');
		Store.setConfig({
			buttons: {
				// cancel: { event: handleModalClose },
				finish: {
					name: 'Добавить свой контакт',
					color: 'primary',
					event: handleAddNewContact
				},
			},
		});
	}, [Store, handleAddNewContact, setTitle]);
	
	return (
		<div className={css.wrapper} {...props}>
			<TextField className={css.info}>
				Найдено {DateSuffix(
					contactsFound.length, 
					['контакт', 'контакта', 'контактов'], 
					true
				)} с такими данными. Выберите нужный или добавьте новый.
			</TextField>

			{contactsFound.map((contact) => (
				<ContactCard
					key={contact.id}
					contact={contact}
					onClick={() => handleConnect(contact)}
				/>
			))}
		</div>
	);
};
