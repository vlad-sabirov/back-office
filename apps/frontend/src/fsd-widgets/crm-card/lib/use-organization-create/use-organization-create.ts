import { useCallback } from 'react';
import { CrmContactService, ICrmContactEntity } from '@fsd/entities/crm-contact';
import { ICrmContactFormEntity } from '@fsd/entities/crm-contact/entity';
import { CrmEmailService } from '@fsd/entities/crm-email';
import { CrmHistoryService } from '@fsd/entities/crm-history';
import { CrmOrganizationService } from '@fsd/entities/crm-organization';
import { CrmPhoneService } from '@fsd/entities/crm-phone';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { useUserDeprecated } from '@hooks';
import { showNotification } from '@mantine/notifications';

export const useOrganizationCreate = () => {
	const current = useStateSelector((state) => state.crm_organization.data.current);
	const [createContactsFetch] = CrmContactService.create();
	const [createPhonesFetch] = CrmPhoneService.create();
	const [createEmailsFetch] = CrmEmailService.create();
	const [connectContacts] = CrmOrganizationService.connectContacts();
	const [createHistoryFetch] = CrmHistoryService.create();
	const { user } = useUserDeprecated();

	return useCallback(
		async (contact: ICrmContactFormEntity): Promise<boolean | ICrmContactEntity> => {
			if (!current?.id || !user) {
				return false;
			}

			const createResponse = await createContactsFetch({
				name: contact.name,
				workPosition: contact.workPosition,
				birthday: contact.birthday ?? '',
				comment: contact.comment,
				isArchive: false,
				userId: user.id,
				isVerified: true,
			});

			if ('error' in createResponse) {
				showNotification({
					color: 'red',
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					message: createResponse.error.data.message || 'Неизвестная ошибка, обратитесь в IT отдел.',
				});
				return false;
			}

			if (contact.phones?.length) {
				for (const { value, comment } of contact.phones) {
					const createPhoneResponse = await createPhonesFetch({
						contactId: createResponse.data.id,
						type: 'contact',
						value,
						comment,
					});

					if ('error' in createPhoneResponse) {
						showNotification({
							color: 'red',
							message:
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore
								createPhoneResponse.error.data.message || 'Неизвестная ошибка, обратитесь в IT отдел.',
						});
						return false;
					}
				}
			}

			if (contact.emails?.length) {
				for (const { value, comment } of contact.emails) {
					const createEmailResponse = await createEmailsFetch({
						contactId: createResponse.data.id,
						type: 'contact',
						value,
						comment,
					});

					if ('error' in createEmailResponse) {
						showNotification({
							color: 'red',
							message:
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore
								createEmailResponse.error.data.message || 'Неизвестная ошибка, обратитесь в IT отдел.',
						});
						return false;
					}
				}
			}

			const connectResponse = await connectContacts({
				organizationId: current.id,
				contactIds: current.contacts?.length
					? [...current.contacts.map(({ id }) => id), createResponse.data.id]
					: [createResponse.data.id],
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
				`${user.sex === 'male' ? 'Добавил' : 'Добавила'} контакт` +
				` "${contact.name}" и ${user.sex === 'male' ? 'прикрепил' : 'прикрепила'}` +
				` его к организации "${current.nameEn} (${current.nameRu})"`;
			const createHistoryResponse = await createHistoryFetch({
				contactId: createResponse.data.id,
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

			if ('data' in createResponse) {
				return createResponse.data;
			}

			return true;
		},
		[current, user, createContactsFetch, connectContacts, createHistoryFetch, createPhonesFetch, createEmailsFetch]
	);
};
