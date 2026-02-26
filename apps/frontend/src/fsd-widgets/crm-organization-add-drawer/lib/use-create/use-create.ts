import { useCallback } from 'react';
import { IUseCreateCleanData } from './use-create.types';
import { trim } from 'lodash';
import { CrmContactService } from '@fsd/entities/crm-contact';
import { CrmEmailService } from '@fsd/entities/crm-email';
import { CrmHistoryService } from '@fsd/entities/crm-history';
import { CrmOrganizationConst, CrmOrganizationService } from '@fsd/entities/crm-organization';
import { CrmOrganizationRequisiteService } from '@fsd/entities/crm-organization-requisite';
import { CrmPhoneService } from '@fsd/entities/crm-phone';
import { useAccess, useStateSelector } from '@fsd/shared/lib/hooks';
import { useUserDeprecated } from '@hooks';
import { showNotification } from '@mantine/notifications';

interface IError {
	data: { message: string };
}

const cleanData: IUseCreateCleanData = {
	organization: null,
	phones: [],
	emails: [],
	requisites: [],
	contacts: [],
};

export const useCreate = () => {
	const { user } = useUserDeprecated();
	const isCrmAdmin = useAccess({ access: CrmOrganizationConst.Access.Admin });
	const [createHistory] = CrmHistoryService.create();
	const [createOrganizationFetch] = CrmOrganizationService.create();
	const [connectContactsToOrganizationFetch] = CrmOrganizationService.connectContacts();
	const [connectTagsToOrganizationFetch] = CrmOrganizationService.connectTags();
	const [deleteOrganizationFetch] = CrmOrganizationService.deleteById();
	const [createPhoneFetch] = CrmPhoneService.create();
	const [deletePhoneFetch] = CrmPhoneService.delete();
	const [createEmailFetch] = CrmEmailService.create();
	const [deleteEmailFetch] = CrmEmailService.delete();
	const [createRequisiteFetch] = CrmOrganizationRequisiteService.create();
	const [deleteRequisiteFetch] = CrmOrganizationRequisiteService.deleteById();
	const [createContactFetch] = CrmContactService.create();
	const [deleteContactFetch] = CrmContactService.deleteById();
	const [elasticIndexFetch] = CrmOrganizationService.searchIndexById();

	const {
		nameRu,
		nameEn,
		firstDocument,
		website,
		comment,
		userId,
		typeId,
		phones,
		emails,
		requisites,
		contacts,
		tags,
	} = useStateSelector((state) => state.crm_organization_add_drawer.values);

	const clear = useCallback(async () => {
		if (cleanData.organization) {
			await deleteOrganizationFetch(cleanData.organization);
		}

		if (cleanData.phones.length) {
			for (const phone of cleanData.phones) {
				await deletePhoneFetch({ id: phone });
			}
		}

		if (cleanData.emails.length) {
			for (const email of cleanData.emails) {
				await deleteEmailFetch({ id: email });
			}
		}

		if (cleanData.requisites.length) {
			for (const requisite of cleanData.requisites) {
				await deleteRequisiteFetch(requisite);
			}
		}

		if (cleanData.contacts.length) {
			for (const contact of cleanData.contacts) {
				await deleteContactFetch(contact[0]);
			}
		}
	}, [deleteOrganizationFetch, deletePhoneFetch, deleteEmailFetch, deleteRequisiteFetch, deleteContactFetch]);

	const createOrganization = useCallback(async () => {
		const response = await createOrganizationFetch({
			nameRu,
			nameEn,
			firstDocument,
			website,
			comment,
			userId,
			typeId,
			isVerified: isCrmAdmin ?? false,
			isReserve: false,
			isArchive: false,
		});
		if ('error' in response) {
			return error(response.error as IError);
		}
		cleanData.organization = response.data.id;
	}, [comment, createOrganizationFetch, firstDocument, isCrmAdmin, nameEn, nameRu, typeId, userId, website]);

	const connectTags = useCallback(async () => {
		if (!cleanData.organization) {
			return error(undefined);
		}
		const response = await connectTagsToOrganizationFetch({
			organizationId: cleanData.organization,
			tagIds: tags,
		});
		if ('error' in response) {
			return error(response.error as IError);
		}
	}, [connectTagsToOrganizationFetch, tags]);

	const createPhones = useCallback(async () => {
		if (!cleanData.organization) {
			return error(undefined);
		}
		for (const phone of phones) {
			if (!trim(phone.value).length) {
				continue;
			}
			const response = await createPhoneFetch({
				value: phone.value,
				comment: phone.comment,
				type: 'organization',
				organizationId: cleanData.organization,
			});
			if ('error' in response) {
				return error(response.error as IError);
			}
			cleanData.phones.push(response.data.id);
		}
	}, [createPhoneFetch, phones]);

	const createEmails = useCallback(async () => {
		if (!cleanData.organization) {
			return error(undefined);
		}
		for (const email of emails) {
			if (!trim(email.value).length) {
				continue;
			}
			const response = await createEmailFetch({
				value: email.value,
				comment: email.comment,
				type: 'organization',
				organizationId: cleanData.organization,
			});
			if ('error' in response) {
				return error(response.error as IError);
			}
			cleanData.emails.push(response.data.id);
		}
	}, [createEmailFetch, emails]);

	const createRequisites = useCallback(async () => {
		if (!cleanData.organization) {
			return error(undefined);
		}
		for (const requisite of requisites) {
			const response = await createRequisiteFetch({
				name: requisite.name,
				inn: requisite.inn,
				code1c: requisite.code1c,
				organizationId: cleanData.organization,
			});
			if ('error' in response) {
				console.error('Ошибка при создании реквизита:', response.error);
				return error(response.error as IError);
			}
			cleanData.requisites.push(response.data.id);
		}
	}, [createRequisiteFetch, requisites]);

	const connectContacts = useCallback(async () => {
		if (!cleanData.organization) {
			return error(undefined);
		}
		const filteredContacts = contacts.filter((contact) => contact.type === 'connect');
		const response = await connectContactsToOrganizationFetch({
			organizationId: cleanData.organization,
			contactIds: filteredContacts.filter((contact) => contact.type === 'connect').map((contact) => contact.id),
		});
		if ('error' in response) {
			return error(response.error as IError);
		}

		for (const contact of filteredContacts) {
			const responseHistory = await createHistory({
				type: 'log',
				payload:
					`${user?.sex === 'male' ? 'Прикрепил' : 'Прикрепила'} ` +
					`контакт "${contact.name}", к организации ${nameRu}}`,
				userId: user?.id || 0,
				organizationId: cleanData.organization,
				isSystem: true,
			});
			if ('error' in responseHistory) {
				return error(responseHistory.error as IError);
			}
		}
	}, [connectContactsToOrganizationFetch, contacts, createHistory, nameRu, user?.id, user?.sex]);

	const createContacts = useCallback(async () => {
		if (!cleanData.organization) {
			return error(undefined);
		}
		const filteredContacts = contacts.filter((contact) => contact.type === 'create');
		for (const contact of filteredContacts) {
			const response = await createContactFetch({
				name: contact.name,
				workPosition: contact.workPosition,
				birthday: contact.birthday ?? '',
				userId: contact.userId,
				comment: contact.comment,
				isArchive: false,
				isVerified: true,
			});
			if ('error' in response) {
				return error(response.error as IError);
			}
			cleanData.contacts.push([response.data.id, response.data.name]);

			if (contact.phones.length) {
				for (const phone of contact.phones) {
					if (!trim(phone.value).length) {
						continue;
					}
					const responsePhone = await createPhoneFetch({
						value: phone.value,
						comment: phone.comment,
						type: 'contact',
						contactId: response.data.id,
					});
					if ('error' in responsePhone) {
						return error(responsePhone.error as IError);
					}
					cleanData.phones.push(responsePhone.data.id);
				}
			}

			if (contact.emails.length) {
				for (const email of contact.emails) {
					if (!trim(email.value).length) {
						continue;
					}
					const responseEmail = await createEmailFetch({
						value: email.value,
						comment: email.comment,
						type: 'contact',
						contactId: response.data.id,
					});
					if ('error' in responseEmail) {
						return error(responseEmail.error as IError);
					}
					cleanData.emails.push(responseEmail.data.id);
				}
			}
		}

		const response = await connectContactsToOrganizationFetch({
			organizationId: cleanData.organization,
			contactIds: cleanData.contacts.map((contact) => contact[0]),
		});
		if ('error' in response) {
			return error(response.error as IError);
		}
	}, [connectContactsToOrganizationFetch, contacts, createContactFetch, createEmailFetch, createPhoneFetch]);

	const crateHistory = useCallback(async () => {
		if (cleanData.organization) {
			const responseHistory = await createHistory({
				type: 'log',
				payload: `${user?.sex === 'male' ? 'Добавил' : 'Добавила'} организацию ${nameRu}`,
				userId: user?.id || 0,
				organizationId: cleanData.organization,
				isSystem: true,
			});
			if ('error' in responseHistory) {
				return error(responseHistory.error as IError);
			}
		}

		for (const contact of cleanData.contacts) {
			const responseHistory = await createHistory({
				type: 'log',
				payload: `${user?.sex === 'male' ? 'Добавил' : 'Добавила'} контакт ${contact[1]}`,
				userId: user?.id || 0,
				contactId: contact[0],
				isSystem: true,
			});
			if ('error' in responseHistory) {
				return error(responseHistory.error as IError);
			}
		}
	}, [createHistory, nameRu, user?.id, user?.sex]);

	const error = (err: IError | undefined) => {
		showNotification({
			color: 'red',
			message: err?.data?.message || 'Неизвестная ошибка, обратитесь в IT отдел за помощью',
		});
		throw ' ';
	};

	return useCallback(async (): Promise<boolean> => {
		try {
			await createOrganization();
			await connectTags();
			await createPhones();
			await createEmails();
			await createRequisites();
			await connectContacts();
			await createContacts();
			await crateHistory();

			if (cleanData.organization) {
				await elasticIndexFetch({ id: cleanData.organization });
			}
			return true;
		} catch (err) {
			await clear();
			return false;
		}
	}, [
		createOrganization,
		connectTags,
		createPhones,
		createEmails,
		createRequisites,
		connectContacts,
		createContacts,
		crateHistory,
		elasticIndexFetch,
		clear,
	]);
};
