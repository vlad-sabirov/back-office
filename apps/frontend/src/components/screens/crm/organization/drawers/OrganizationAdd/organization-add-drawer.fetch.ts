import { trim } from 'lodash';
import {
	CrmContactService,
	CrmEmailService,
	CrmOrganizationRequisiteService,
	CrmOrganizationService,
	CrmPhoneService,
} from '@services/crm';
import { OrganizationAddDrawerFetchClean, OrganizationAddDrawerFormProps } from './organization-add-drawer.props';

export class OrganizationAddDrawerFetch {
	res: number | null = null;
	err: string | null = null;
	private form: OrganizationAddDrawerFormProps;
	private cleanData: OrganizationAddDrawerFetchClean = {
		organization: null,
		phones: [],
		emails: [],
		requisites: [],
		contacts: [],
	};

	constructor(form: OrganizationAddDrawerFormProps) {
		this.form = form;
	}

	exec = async () => {
		try {
			await this.createOrganization();
			await this.connectTags();
			await this.createRequisites();
			await this.createPhones();
			await this.createEmails();
			await this.createContacts();
			this.res = this.cleanData.organization;
		} catch (err: unknown) {
			if (err instanceof Error) {
				this.err = err.message;
				await this.clean();
			}
		}
	};

	private clean = async () => {
		const { organization, phones, emails, requisites, contacts } = this.cleanData;
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

	private createOrganization = async () => {
		const [resOrg, errOrg] = await CrmOrganizationService.create({
			createDto: {
				name: this.form.values.organization.name,
				firstDocument: this.form.values.organization.firstDocument,
				website: this.form.values.organization.website,
				comment: this.form.values.organization.comment,
				userId: this.form.values.organization.userId,
				typeId: this.form.values.organization.typeId,
				isVerified: false,
				isReserve: false,
				isArchive: false,
			},
		});
		if (errOrg) throw new Error(errOrg.message);
		if (resOrg) this.cleanData.organization = resOrg.id;
	};

	private connectTags = async () => {
		if (!this.cleanData.organization) throw new Error('Organization id is null');
		const [, errTags] = await CrmOrganizationService.connectTagsById({
			organizationId: this.cleanData.organization,
			tagIds: this.form.values.tags,
		});
		if (errTags) throw new Error(errTags.message);
	};

	private createRequisites = async () => {
		if (!this.cleanData.organization) throw new Error('Organization id is null');
		if (!this.form.values.requisites.length) return;
		for (const requisite of this.form.values.requisites) {
			const [resRequisite, errRequisite] = await CrmOrganizationRequisiteService.create({
				createDto: {
					name: requisite.name,
					inn: requisite.inn,
					code1c: requisite.code1c,
					organizationId: this.cleanData.organization,
				},
			});
			if (errRequisite) throw new Error(errRequisite.message);
			if (resRequisite) this.cleanData.requisites?.push(resRequisite.id);
		}
	};

	private createPhones = async () => {
		if (!this.cleanData.organization) throw new Error('Organization id is null');
		if (!this.form.values.phones.length) return;
		for (const phone of this.form.values.phones) {
			if (trim(phone.value).length === 0) continue;
			const [resPhone, errPhone] = await CrmPhoneService.create({
				createDto: {
					type: 'organization',
					organizationId: this.cleanData.organization,
					value: phone.value,
					comment: phone.comment,
				},
			});
			if (errPhone) throw new Error(errPhone.message);
			if (resPhone) this.cleanData.phones?.push(resPhone.id);
		}
	};

	private createEmails = async () => {
		if (!this.cleanData.organization) throw new Error('Organization id is null');
		if (!this.form.values.emails.length) return;
		for (const email of this.form.values.emails) {
			if (trim(email.value).length === 0) continue;
			const [resEmail, errEmail] = await CrmEmailService.create({
				createDto: {
					type: 'organization',
					organizationId: this.cleanData.organization,
					value: email.value,
					comment: email.comment,
				},
			});
			if (errEmail) throw new Error(errEmail.message);
			if (resEmail) this.cleanData.emails?.push(resEmail.id);
		}
	};

	private createContacts = async () => {
		if (!this.cleanData.organization) throw new Error('Organization id is null');
		if (!this.form.values.contacts.length) return;

		for (const contact of this.form.values.contacts) {
			if (contact.type === 'create') {
				const [resContact, errContact] = await CrmContactService.create({
					createDto: {
						name: contact.name,
						workPosition: contact.workPosition,
						birthday: contact.birthday || undefined,
						comment: contact.comment,
						userId: this.form.values.organization.userId,
						isVerified: true,
						isArchive: false,
					},
				});
				if (errContact) throw new Error(errContact.message);
				if (resContact) this.cleanData.contacts?.push([resContact.id, 'create']);

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
						if (resPhone) this.cleanData.phones?.push(resPhone.id);
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
						if (resEmail) this.cleanData.emails?.push(resEmail.id);
					}
				}
			}
			const contactsToConnect = this.cleanData.contacts?.filter((item) => item[1] === 'create') || [];
			if (contactsToConnect.length) {
				await CrmOrganizationService.connectContactsById({
					organizationId: this.cleanData.organization,
					contactIds: contactsToConnect.map((item) => item[0]) || [],
				});
			}
		}

		const contactsToConnect = this.form.values.contacts.filter((item) => item.type === 'connect') || [];
		if (contactsToConnect.length) {
			await CrmOrganizationService.connectContactsById({
				organizationId: this.cleanData.organization,
				contactIds: contactsToConnect.map((item) => item.id) || [],
			});
		}
	};
}
