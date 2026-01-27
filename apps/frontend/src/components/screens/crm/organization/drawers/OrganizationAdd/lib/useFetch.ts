// eslint-disable-next-line max-len
import { trim } from 'lodash';
import { CrmOrganizationService as CrmOrganizationServiceRTK } from '@fsd/entities/crm-organization';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import {
	CrmContactService,
	CrmEmailService,
	CrmOrganizationRequisiteService,
	CrmOrganizationService,
	CrmPhoneService,
} from '@services';
import { OrganizationAddDrawerFetchClean, OrganizationAddDrawerFormProps } from '../organization-add-drawer.props';

export const useFetch = (form: OrganizationAddDrawerFormProps) => {
	const cleanData: OrganizationAddDrawerFetchClean = {
		organization: null,
		phones: [],
		emails: [],
		requisites: [],
		contacts: [],
	};
	const filterList = useStateSelector((state) => state.crm_organization.filter.list);
	const [fetchOrg] = CrmOrganizationServiceRTK.fetchList();

	const exec = async () => {
		let response: number | null = null;
		let error: string | null = null;

		try {
			await createOrganization();
			await connectTags();
			await createRequisites();
			await createPhones();
			await createEmails();
			await createContacts();
			await fetchOrg(filterList);
			response = cleanData.organization;
		} catch (err: unknown) {
			if (err instanceof Error) {
				await clean();
				error = err.message;
			}
		}

		return [response, error];
	};

	const clean = async () => {
		const { organization, phones, emails, requisites, contacts } = cleanData;
		if (requisites.length) {
			for (const requisite of requisites) {
				await CrmOrganizationRequisiteService.deleteById(requisite);
			}
		}

		if (contacts.length) {
			for (const [contact, type] of contacts) {
				if (type === 'create') await CrmContactService.deleteById(contact);
			}
		}

		if (organization) {
			await CrmOrganizationService.deleteById(organization);
		}

		if (phones.length) {
			for (const phone of phones) {
				await CrmPhoneService.deleteById(phone);
			}
		}

		if (emails.length) {
			for (const email of emails) {
				await CrmEmailService.deleteById(email);
			}
		}
	};

	const createOrganization = async () => {
		const [resOrg, errOrg] = await CrmOrganizationService.create({
			createDto: {
				name: form.values.organization.name,
				firstDocument: form.values.organization.firstDocument,
				website: form.values.organization.website,
				comment: form.values.organization.comment,
				userId: form.values.organization.userId,
				typeId: form.values.organization.typeId,
				isVerified: false,
				isReserve: false,
				isArchive: false,
			},
		});
		if (errOrg) throw new Error(errOrg.message);
		if (resOrg) cleanData.organization = resOrg.id;
	};

	const connectTags = async () => {
		if (!cleanData.organization) throw new Error('Organization id is null');
		const [, errTags] = await CrmOrganizationService.connectTagsById({
			organizationId: cleanData.organization,
			tagIds: form.values.tags,
		});
		if (errTags) throw new Error(errTags.message);
	};

	const createRequisites = async () => {
		if (!cleanData.organization) throw new Error('Organization id is null');
		if (!form.values.requisites.length) return;
		for (const requisite of form.values.requisites) {
			const [resRequisite, errRequisite] = await CrmOrganizationRequisiteService.create({
				createDto: {
					name: requisite.name,
					inn: requisite.inn,
					code1c: requisite.code1c,
					organizationId: cleanData.organization,
				},
			});
			if (errRequisite) throw new Error(errRequisite.message);
			if (resRequisite) cleanData.requisites?.push(resRequisite.id);
		}
	};

	const createPhones = async () => {
		if (!cleanData.organization) throw new Error('Organization id is null');
		if (!form.values.phones.length) return;
		for (const phone of form.values.phones) {
			if (trim(phone.value).length === 0) continue;
			const [resPhone, errPhone] = await CrmPhoneService.create({
				createDto: {
					type: 'organization',
					organizationId: cleanData.organization,
					value: phone.value,
					comment: phone.comment,
				},
			});
			if (errPhone) throw new Error(errPhone.message);
			if (resPhone) cleanData.phones?.push(resPhone.id);
		}
	};

	const createEmails = async () => {
		if (!cleanData.organization) throw new Error('Organization id is null');
		if (!form.values.emails.length) return;
		for (const email of form.values.emails) {
			if (trim(email.value).length === 0) continue;
			const [resEmail, errEmail] = await CrmEmailService.create({
				createDto: {
					type: 'organization',
					organizationId: cleanData.organization,
					value: email.value,
					comment: email.comment,
				},
			});
			if (errEmail) throw new Error(errEmail.message);
			if (resEmail) cleanData.emails?.push(resEmail.id);
		}
	};

	const createContacts = async () => {
		if (!cleanData.organization) throw new Error('Organization id is null');
		if (!form.values.contacts.length) return;

		for (const contact of form.values.contacts) {
			if (contact.type === 'create') {
				const [resContact, errContact] = await CrmContactService.create({
					createDto: {
						name: contact.name,
						workPosition: contact.workPosition,
						birthday: contact.birthday || undefined,
						comment: contact.comment,
						userId: form.values.organization.userId,
						isVerified: true,
						isArchive: false,
					},
				});
				if (errContact) throw new Error(errContact.message);
				if (resContact) cleanData.contacts?.push([resContact.id, 'create']);

				if (contact.phones.length && resContact) {
					for (const phone of contact.phones) {
						if (trim(phone.value).length === 0) continue;
						const [resPhone, errPhone] = await CrmPhoneService.create({
							createDto: {
								type: 'contact',
								contactId: resContact.id,
								value: phone.value,
								comment: phone.comment,
							},
						});
						if (errPhone) throw new Error(errPhone.message);
						if (resPhone) cleanData.phones?.push(resPhone.id);
					}
				}

				if (contact.emails.length && resContact) {
					for (const email of contact.emails) {
						if (trim(email.value).length === 0) continue;
						const [resEmail, errEmail] = await CrmEmailService.create({
							createDto: {
								type: 'contact',
								contactId: resContact.id,
								value: email.value,
								comment: email.comment,
							},
						});
						if (errEmail) throw new Error(errEmail.message);
						if (resEmail) cleanData.emails?.push(resEmail.id);
					}
				}
			}
			const contactsToConnect = cleanData.contacts?.filter((item) => item[1] === 'create') || [];
			if (contactsToConnect.length) {
				await CrmOrganizationService.connectContactsById({
					organizationId: cleanData.organization,
					contactIds: contactsToConnect.map((item) => item[0]) || [],
				});
			}
		}

		const contactsToConnect = form.values.contacts.filter((item) => item.type === 'connect') || [];
		if (contactsToConnect.length) {
			await CrmOrganizationService.connectContactsById({
				organizationId: cleanData.organization,
				contactIds: contactsToConnect.map((item) => item.id) || [],
			});
		}
	};

	return exec;
};
