import { FC } from 'react';
import { capitalize } from 'lodash';
import { CrmCardTypes, useCrmCardShowDrawer } from '@fsd/entities/crm-card';
import { CrmCardPhones } from '@fsd/entities/crm-phone';
import { TextField } from '@fsd/shared/ui-kit';
import { IContactsInfoProps } from './contacts-info.props';
import css from './contacts-info.module.scss';

export const ContactsInfo: FC<IContactsInfoProps> = ({ contacts }) => {
	const showDrawer = useCrmCardShowDrawer();

	return (
		<div className={css.wrapper}>
			<TextField mode={'heading'} size={'small'}>
				Контакты
			</TextField>

			<div className={css.contacts}>
				{contacts &&
					!!contacts.length &&
					contacts.map((contact) => (
						<div key={contact.id} className={css.contact}>
							<TextField
								className={css.name}
								onClick={() => {
									showDrawer({
										type: CrmCardTypes.Contact,
										id: contact.id,
									});
								}}
							>
								{' '}
								{contact.name}{' '}
							</TextField>
							<TextField size={'small'} className={css.workPosition}>
								{capitalize(contact.workPosition)}
							</TextField>
							<CrmCardPhones phones={contact.phones} name={contact.name} />
						</div>
					))}
			</div>

			<TextField className={css.add}>Добавить</TextField>
		</div>
	);
};
