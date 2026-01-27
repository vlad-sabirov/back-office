import { TextField } from '@fsd/shared/ui-kit';
import cn from 'classnames';
import { FC } from 'react';
import { ContactsT } from '.';
import css from './contacts.module.scss';

export const Contacts: FC<ContactsT> = (
	{ organization, className }
) => {
	return (
		<TextField className={cn(css.text, className)}>
			{
				organization.contacts
					&& !!organization.contacts.length
					&& organization.contacts[0].name.toLocaleLowerCase()
			}

			{
				organization.contacts
					&& organization.contacts?.length > 1
					&& <span>еще {organization.contacts.length - 1}...</span>
			}
		</TextField>
	);
};
