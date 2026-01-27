import { FC, useCallback } from 'react';
import { CrmContactsCardInfo } from 'fsd-features/crm-contacts-card-info__new';
import { useActions } from '@fsd/entities/crm-card/lib/useActions/useActions';
import { ICrmContactFormEntity } from '@fsd/entities/crm-contact/entity';
import { useCrmOrganizationGetCurrent } from '@fsd/entities/crm-organization';
import {
	CrmOrganizationRequisiteCard,
	ICrmOrganizationRequisiteFormEntity,
} from '@fsd/entities/crm-organization-requisite';
import { CrmOrganizationCardInfo } from '@fsd/features/crm-organization-card-info';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Divider } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useOrganizationConnect } from '../../../lib/use-organization-connect';
import { useOrganizationCreate } from '../../../lib/use-organization-create';
import { useOrganizationDisconnect } from '../../../lib/use-organization-disconnect';
import { useRequisiteCreate } from '../../../lib/user-requisite-create';
import { useRequisiteDelete } from '../../../lib/user-requisite-delete';
import { useRequisiteUpdate } from '../../../lib/user-requisite-update';

export const Organization: FC = () => {
	const current = useStateSelector((state) => state.crm_organization.data.current);
	const actions = useActions();
	const createFetch = useOrganizationCreate();
	const connectFetch = useOrganizationConnect();
	const disconnectFetch = useOrganizationDisconnect();
	const createRequisite = useRequisiteCreate();
	const updateRequisite = useRequisiteUpdate();
	const deleteRequisite = useRequisiteDelete();
	const [getCurrentFetch] = useCrmOrganizationGetCurrent();

	const handleCreate = useCallback(
		async (contact: ICrmContactFormEntity) => {
			if (!current) {
				return;
			}
			actions.setIsFetching(true);
			if ((await createFetch(contact)) === false) {
				actions.setIsFetching(false);
				return;
			}
			await getCurrentFetch({ id: current.id });
			showNotification({
				color: 'green',
				message: 'Контакт привязан к организации',
			});
			actions.setIsFetching(false);
		},
		[actions, createFetch, current, getCurrentFetch]
	);

	const handleConnect = useCallback(
		async (contact: ICrmContactFormEntity) => {
			if (!current) {
				return;
			}
			actions.setIsFetching(true);
			if (!(await connectFetch(contact))) {
				actions.setIsFetching(false);
				return;
			}
			await getCurrentFetch({ id: current.id });
			showNotification({
				color: 'green',
				message: 'Контакт привязан к организации',
			});
			actions.setIsFetching(false);
		},
		[actions, connectFetch, current, getCurrentFetch]
	);

	const handleDisconnect = useCallback(
		async (contact: ICrmContactFormEntity) => {
			if (!current) {
				return;
			}
			actions.setIsFetching(true);
			if (!(await disconnectFetch(contact))) {
				actions.setIsFetching(false);
				return;
			}
			await getCurrentFetch({ id: current.id });
			showNotification({
				color: 'green',
				message: 'Контакт отвязан от организации',
			});
			actions.setIsFetching(false);
		},
		[actions, current, disconnectFetch, getCurrentFetch]
	);

	const handleCreateRequisite = useCallback(
		async (requisite: ICrmOrganizationRequisiteFormEntity) => {
			if (!current) {
				return;
			}
			actions.setIsFetching(true);
			if (!(await createRequisite(requisite))) {
				return;
			}
			await getCurrentFetch({ id: current.id });
			showNotification({
				color: 'green',
				message: 'Реквизиты добавлены',
			});
			actions.setIsFetching(false);
		},
		[actions, createRequisite, current, getCurrentFetch]
	);

	const handleDeleteRequisite = useCallback(
		async (requisite: ICrmOrganizationRequisiteFormEntity) => {
			if (!current) {
				return;
			}
			actions.setIsFetching(true);
			if (!(await deleteRequisite(requisite))) {
				return;
			}
			await getCurrentFetch({ id: current.id });
			showNotification({
				color: 'green',
				message: 'Реквизиты удалены',
			});
			actions.setIsFetching(false);
		},
		[actions, current, deleteRequisite, getCurrentFetch]
	);

	const handleUpdateRequisite = useCallback(
		async (requisite: ICrmOrganizationRequisiteFormEntity) => {
			if (!current) {
				return;
			}
			actions.setIsFetching(true);
			if (!(await updateRequisite(requisite))) {
				return;
			}
			await getCurrentFetch({ id: current.id });
			showNotification({
				color: 'green',
				message: 'Реквизиты изменены',
			});
			actions.setIsFetching(false);
		},
		[actions, current, getCurrentFetch, updateRequisite]
	);

	if (!current) {
		return null;
	}
	return (
		<>
			<CrmOrganizationCardInfo />
			{!current.isArchive && (
				<>
					<Divider style={{ margin: '40px 0px' }} />
					<CrmContactsCardInfo
						data={
							current.contacts
								? current.contacts?.map((contact) => ({
										type: 'connect',
										id: contact.id,
										name: contact.name,
										workPosition: contact.workPosition,
										phones: contact.phones
											? contact.phones.map(({ value, comment }) => ({
													value,
													comment: comment || '',
											  }))
											: [],
										emails: contact.emails
											? contact.emails.map(({ value, comment }) => ({
													value,
													comment: comment || '',
											  }))
											: [],
								  }))
								: []
						}
						onDisconnect={handleDisconnect}
						onCreate={handleCreate}
						onConnect={handleConnect}
						canOpenCard
						displayWorkPosition
						displayPhones
						displayEmails
					/>
				</>
			)}
			<Divider style={{ margin: '40px 0px' }} />
			<CrmOrganizationRequisiteCard
				data={
					current.requisites?.map((requisite) => {
						return {
							id: String(requisite.id),
							name: requisite.name,
							inn: String(requisite.inn),
							code1c: String(requisite.code1c),
							type: 'created',
						};
					}) ?? []
				}
				onCreate={!current?.isArchive ? (requisite) => handleCreateRequisite(requisite) : undefined}
				onUpdate={!current?.isArchive ? (requisite) => handleUpdateRequisite(requisite) : undefined}
				onDelete={!current?.isArchive ? (requisite) => handleDeleteRequisite(requisite) : undefined}
			/>
			<br />
		</>
	);
};
