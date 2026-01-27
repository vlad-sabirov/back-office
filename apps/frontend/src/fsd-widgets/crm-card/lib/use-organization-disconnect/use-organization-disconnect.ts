import { useCallback } from 'react';
import { ICrmContactFormEntity } from '@fsd/entities/crm-contact/entity';
import { CrmHistoryService } from '@fsd/entities/crm-history';
import { CrmOrganizationService } from '@fsd/entities/crm-organization';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { useUserDeprecated } from '@hooks';
import { showNotification } from '@mantine/notifications';

export const useOrganizationDisconnect = () => {
	const current = useStateSelector((state) => state.crm_organization.data.current);
	const [connectContactFetch] = CrmOrganizationService.connectContacts();
	const [createHistoryFetch] = CrmHistoryService.create();
	const { user } = useUserDeprecated();

	return useCallback(
		async (contact: ICrmContactFormEntity): Promise<boolean> => {
			if (!current?.id || !contact || !user) {
				return false;
			}

			const connectResponse = await connectContactFetch({
				organizationId: current.id,
				contactIds: current.contacts?.length
					? current.contacts.filter(({ id }) => id !== contact.id).map((contact) => contact.id)
					: [],
			});

			if ('error' in connectResponse) {
				showNotification({
					color: 'red',
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					message: connectResponse.error.data.message || 'Неизвестная ошибка, обратитесь в IT отдел.',
				});
				return false;
			}

			const message =
				`${user.sex === 'male' ? 'Открепил' : 'Открепила'} контакт` +
				` "${contact.name}" от организации "${current.nameEn} (${current.nameRu})"`;
			const createHistoryResponse = await createHistoryFetch({
				contactId: contact.id,
				organizationId: current.id,
				type: 'log',
				userId: user.id,
				payload: message,
				isSystem: true,
			});

			if ('error' in createHistoryResponse) {
				showNotification({
					color: 'red',
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					message: createHistoryResponse.error.data.message || 'Неизвестная ошибка, обратитесь в IT отдел.',
				});
				return false;
			}

			return true;
		},
		[connectContactFetch, createHistoryFetch, current, user]
	);
};
