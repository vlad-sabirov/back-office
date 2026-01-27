import { FC } from 'react';
import { IContactsProps } from './contacts.types';
import { TextField } from '@fsd/shared/ui-kit';
import { parsePhoneNumber } from '@helpers';
import css from '../_staff-profile/staff-profile.module.scss';

export const Contacts: FC<IContactsProps> = (props) => {
	const { user } = props;

	if (!user) {
		return null;
	}

	return (
		<>
			<TextField className={css.contactsTitle} mode={'heading'} size={'small'}>
				Контактная информация
			</TextField>
			<div className={css.contacts}>
				{!!user.phoneMobile && (
					<TextField className={css.simpleBlock} size={'small'}>
						Мобильный номер <span>{parsePhoneNumber(user.phoneMobile).output}</span>
					</TextField>
				)}

				{!!user.phoneVoip && (
					<TextField className={css.simpleBlock} size={'small'}>
						Внутренний номер <span>{user.phoneVoip}</span>
					</TextField>
				)}

				{!!user.email && (
					<TextField className={css.simpleBlock} size={'small'}>
						Email <span>{user.email}</span>
					</TextField>
				)}

				{!!user.telegram && (
					<TextField className={css.simpleBlock} size={'small'}>
						Telegram <span>{user.telegram}</span>
					</TextField>
				)}

				{!!user.facebook && (
					<TextField className={css.simpleBlock} size={'small'}>
						Facebook <span>{user.facebook}</span>
					</TextField>
				)}

				{!!user.instagram && (
					<TextField className={css.simpleBlock} size={'small'}>
						Instagram <span>{user.instagram}</span>
					</TextField>
				)}
			</div>
		</>
	);
};
