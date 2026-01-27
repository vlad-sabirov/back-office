import { FC, useCallback } from 'react';
import { IContactsProps } from './tab-contacts.types';
import cn from 'classnames';
import { CrmCardTypes, useCrmCardShowDrawer } from '@fsd/entities/crm-card';
import { CrmContactConst } from '@fsd/entities/crm-contact';
import { useSearchActions } from '@fsd/entities/search';
import { useAccess } from '@fsd/shared/lib/hooks';
import { SuffixFormat } from '@fsd/shared/lib/suffix-format';
import { Icon, Tabs, TextField } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import css from './tab-contacts.module.scss';

export const TabContactList: FC<IContactsProps> = ({ index, disabled, contacts }) => {
	return (
		<Tabs.Tab icon={<Icon name={'todo'} />} value={index} disabled={disabled}>
			{SuffixFormat(contacts?.length ?? 0, ['Контакт', 'Контакта', 'Контактов'])} {contacts?.length}
		</Tabs.Tab>
	);
};

export const TabContactPanel: FC<IContactsProps> = ({ contacts, index }) => {
	const showDrawer = useCrmCardShowDrawer();
	const searchActions = useSearchActions();
	const isCrmAdmin = useAccess({ access: CrmContactConst.Access.Admin });
	const { team } = useUserDeprecated();

	const handleShowDrawer = useCallback(
		(id: number | string) => {
			searchActions.setIsShowModal(false);
			searchActions.setValue('');
			showDrawer({ type: CrmCardTypes.Contact, id });
		},
		[searchActions, showDrawer]
	);

	return (
		<Tabs.Panel value={index}>
			<div className={css.wrapper}>
				{contacts?.map((contact) => {
					const isAccess = isCrmAdmin || !contact.userId || team?.includes(Number(contact.userId));
					return (
						<div
							key={contact.id}
							className={cn(css.contact, { [css.disabled]: !isAccess })}
							onClick={() => handleShowDrawer(contact.id)}
						>
							<TextField className={css.name}>{contact.name}</TextField>

							{!!contact.description.length && (
								<TextField className={css.description}>Организации: {contact.description}</TextField>
							)}

							<TextField className={css.userId}>
								Ответственный:{' '}
								{!contact.user
									? 'Свободные'
									: contact.user.id === 1
									? 'Приоритетные'
									: `${contact.user?.lastName} ${contact.user?.firstName}`}
							</TextField>
						</div>
					);
				})}
			</div>
		</Tabs.Panel>
	);
};
