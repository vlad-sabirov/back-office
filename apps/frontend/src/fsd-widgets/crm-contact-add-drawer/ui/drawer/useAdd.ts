import { IContactAddClearData } from './contact-add.types';
import { trim } from 'lodash';
import { CrmContactService, ICrmContactAddForm } from '@fsd/entities/crm-contact';
import { CrmEmailService } from '@fsd/entities/crm-email';
import { CrmHistoryService } from '@fsd/entities/crm-history';
import { CrmPhoneService } from '@fsd/entities/crm-phone';
import { useUserDeprecated } from '@hooks';
import { showNotification } from '@mantine/notifications';

export const useAdd = (values: ICrmContactAddForm['values']) => {
	const cleanData: IContactAddClearData = {
		contact: null,
		phones: [],
		emails: [],
		organizations: [],
	};
	const [createContactFetch] = CrmContactService.add();
	const [orgConnectContactFetch] = CrmContactService.connectOrganizations();
	const [deleteContactFetch] = CrmContactService.delete();
	const [createPhoneFetch] = CrmPhoneService.add();
	const [deletePhoneFetch] = CrmPhoneService.delete();
	const [createEmailFetch] = CrmEmailService.add();
	const [deleteEmailFetch] = CrmEmailService.delete();
	const [createHistory] = CrmHistoryService.create();
	const [elasticIndexFetch] = CrmContactService.searchIndexById();
	const { user } = useUserDeprecated();

	const clear = async () => {
		if (cleanData.contact) {
			deleteContactFetch({ id: cleanData.contact });
		}
		if (cleanData.phones.length) {
			for (const phone of cleanData.phones) {
				deletePhoneFetch({ id: phone });
			}
		}

		if (cleanData.emails.length) {
			for (const email of cleanData.emails) {
				deleteEmailFetch({ id: email });
			}
		}
	};

	const createContact = async () => {
		const response = await createContactFetch({
			name: values.name,
			workPosition: values.workPosition,
			birthday: values.birthday,
			comment: values.comment,
			userId: values.userId,
			isVerified: true,
			isArchive: false,
		});
		if ('error' in response) {
			return error();
		}
		cleanData.contact = response.data.id;
	};

	const createPhones = async () => {
		for (const phone of values.phones) {
			if (!trim(phone.value).length) {
				continue;
			}
			const response = await createPhoneFetch({
				value: phone.value,
				comment: phone.comment,
				type: 'contact',
				contactId: cleanData.contact || 0,
			});
			if ('error' in response) {
				return error();
			}
			cleanData.phones.push(response.data.id);
		}
	};

	const createEmails = async () => {
		for (const email of values.emails) {
			if (!trim(email.value).length) {
				continue;
			}
			const response = await createEmailFetch({
				value: email.value,
				comment: email.comment,
				type: 'contact',
				contactId: cleanData.contact || 0,
			});
			if ('error' in response) {
				return error();
			}
			cleanData.emails.push(response.data.id);
		}
	};

	const connectOrganization = async () => {
		if (!values.organizations.length) {
			return;
		}
		const response = await orgConnectContactFetch({
			contactId: cleanData.contact || 0,
			organizationIds: values.organizations.map((organization) => organization.id),
		});
		if ('error' in response) {
			return error();
		}
	};

	const crateHistoryEnding = async () => {
		const response = await createHistory({
			type: 'log',
			payload: `${user?.sex === 'male' ? 'Добавил' : 'Добавила'} контакт ${values.name}`,
			userId: user?.id || 0,
			contactId: cleanData.contact || 0,
			isSystem: true,
		});
		if ('error' in response) {
			return error();
		}
	};

	const error = () => {
		showNotification({
			color: 'red',
			message: 'Неизвестная ошибка, обратитесь в IT отдел за помощью',
		});
		throw ' ';
	};

	return async (): Promise<boolean> => {
		try {
			await createContact();
			await createPhones();
			await createEmails();
			await connectOrganization();
			await crateHistoryEnding();

			if (cleanData.contact) {
				await elasticIndexFetch({ id: cleanData.contact });
			}
			return true;
		} catch (error) {
			await clear();
			return false;
		}
	};
};
