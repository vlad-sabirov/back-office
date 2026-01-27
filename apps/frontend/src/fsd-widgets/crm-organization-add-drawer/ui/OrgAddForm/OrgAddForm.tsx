import { FC, useCallback } from 'react';
import {
	IHandleSetEmailsValue,
	IHandleSetError,
	IHandleSetManyError,
	IHandleSetPhonesValue,
	IHandleSetValue,
} from './org-add-form.types';
import { CrmContactsCardInfo } from 'fsd-features/crm-contacts-card-info__new';
import { ICrmContactFormEntity } from '@fsd/entities/crm-contact/entity';
import { CrmEmailsForm } from '@fsd/entities/crm-email';
import {
	CrmOrganizationFormComment,
	CrmOrganizationFormFirstDocument,
	CrmOrganizationFormWebsite,
} from '@fsd/entities/crm-organization';
import { CrmOrganizationFormNameRu } from '@fsd/entities/crm-organization';
import { CrmOrganizationFormNameEn } from '@fsd/entities/crm-organization';
import { CrmOrganizationFormUserId } from '@fsd/entities/crm-organization';
import {
	CrmOrganizationRequisiteCard,
	ICrmOrganizationRequisiteFormEntity,
	useCrmOrganizationRequisiteActions,
} from '@fsd/entities/crm-organization-requisite';
import { CrmOrganizationTagsForm } from '@fsd/entities/crm-organization-tag';
import { CrmOrganizationTypeFormType } from '@fsd/entities/crm-organization-type';
import { CrmPhonesForm } from '@fsd/entities/crm-phone';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Divider } from '@mantine/core';
import { useActions } from '../../lib/useActions/useActions';
import css from './org-add-form.module.scss';

export const OrgAddForm: FC = () => {
	const actions = useActions();
	const requisiteActions = useCrmOrganizationRequisiteActions();

	const nameRu = useStateSelector((state) => state.crm_organization_add_drawer.values.nameRu);
	const nameRuErr = useStateSelector((state) => state.crm_organization_add_drawer.errors.nameRu);
	const nameEn = useStateSelector((state) => state.crm_organization_add_drawer.values.nameEn);
	const nameEnErr = useStateSelector((state) => state.crm_organization_add_drawer.errors.nameEn);
	const firstDocument = useStateSelector((state) => state.crm_organization_add_drawer.values.firstDocument);
	const firstDocumentErr = useStateSelector((state) => state.crm_organization_add_drawer.errors.firstDocument);
	const userId = useStateSelector((state) => state.crm_organization_add_drawer.values.userId);
	const userIdErr = useStateSelector((state) => state.crm_organization_add_drawer.errors.userId);
	const typeId = useStateSelector((state) => state.crm_organization_add_drawer.values.typeId);
	const typeIdErr = useStateSelector((state) => state.crm_organization_add_drawer.errors.typeId);
	const website = useStateSelector((state) => state.crm_organization_add_drawer.values.website);
	const websiteErr = useStateSelector((state) => state.crm_organization_add_drawer.errors.website);
	const comment = useStateSelector((state) => state.crm_organization_add_drawer.values.comment);
	const commentErr = useStateSelector((state) => state.crm_organization_add_drawer.errors.comment);
	const phones = useStateSelector((state) => state.crm_organization_add_drawer.values.phones);
	const phonesErr = useStateSelector((state) => state.crm_organization_add_drawer.errors.phones);
	const emails = useStateSelector((state) => state.crm_organization_add_drawer.values.emails);
	const emailsErr = useStateSelector((state) => state.crm_organization_add_drawer.errors.emails);
	const tags = useStateSelector((state) => state.crm_organization_add_drawer.values.tags);
	const tagsErr = useStateSelector((state) => state.crm_organization_add_drawer.errors.tags);
	const requisites = useStateSelector((state) => state.crm_organization_add_drawer.values.requisites);
	const contacts = useStateSelector((state) => state.crm_organization_add_drawer.values.contacts);

	const handleSetValue = useCallback(
		({ field, value }: IHandleSetValue) => {
			actions.setValues({ [field]: value });
		},
		[actions]
	);

	const handleSetPhonesValue = useCallback(
		({ value }: IHandleSetPhonesValue) => {
			actions.setValues({ phones: value });
		},
		[actions]
	);

	const handleSetEmailsValue = useCallback(
		({ value }: IHandleSetEmailsValue) => {
			actions.setValues({ emails: value });
		},
		[actions]
	);

	const handleSetTagsValue = useCallback(
		({ value }: { value: string[] }) => {
			actions.setValues({ tags: value });
		},
		[actions]
	);

	const handleSetRequisiteValue = useCallback(
		(requisites: ICrmOrganizationRequisiteFormEntity[]) => {
			requisiteActions.setLoading(true);
			actions.setValues({ requisites });
			requisiteActions.setLoading(false);
		},
		[actions, requisiteActions]
	);

	const handleSetError = useCallback(
		({ field, value }: IHandleSetError) => {
			actions.setErrors({ [field]: value });
		},
		[actions]
	);

	const handleSetManyError = useCallback(
		({ field, value }: IHandleSetManyError) => {
			actions.setErrors({ [field]: value });
		},
		[actions]
	);

	const handleContactConnect = useCallback(
		(contact: ICrmContactFormEntity) => {
			actions.setValues({ contacts: [...contacts, contact] });
		},
		[actions, contacts]
	);

	const handleContactCreate = useCallback(
		(contact: ICrmContactFormEntity) => {
			actions.setValues({ contacts: [...contacts, contact] });
		},
		[actions, contacts]
	);

	const handleContactUpdate = useCallback(
		(contact: ICrmContactFormEntity) => {
			actions.setValues({ contacts: contacts.map((item) => (item.id === contact.id ? contact : item)) });
		},
		[actions, contacts]
	);

	const handleContactDisconnect = useCallback(
		(contact: ICrmContactFormEntity) => {
			actions.setValues({ contacts: contacts.filter((item) => item.id !== contact.id) });
		},
		[actions, contacts]
	);

	return (
		<>
			<div className={css.wrapper}>
				<CrmOrganizationFormNameEn
					value={nameEn}
					error={typeof nameEnErr === 'string' ? nameEnErr : undefined}
					onChange={(value) => handleSetValue({ field: 'nameEn', value })}
					onError={(value) => handleSetError({ field: 'nameEn', value })}
					required
				/>

				<CrmOrganizationFormNameRu
					value={nameRu}
					error={typeof nameRuErr === 'string' ? nameRuErr : undefined}
					onChange={(value) => handleSetValue({ field: 'nameRu', value })}
					onError={(value) => handleSetError({ field: 'nameRu', value })}
					required
				/>

				<CrmOrganizationFormFirstDocument
					value={firstDocument}
					onChange={(value) => handleSetValue({ field: 'firstDocument', value })}
					error={typeof firstDocumentErr === 'string' ? firstDocumentErr : undefined}
					onError={(value) => handleSetError({ field: 'firstDocument', value })}
					required
				/>

				<CrmOrganizationFormUserId
					value={userId ? String(userId) : undefined}
					onChange={(value) => handleSetValue({ field: 'userId', value })}
					error={typeof userIdErr === 'string' ? userIdErr : undefined}
					onError={(value) => handleSetError({ field: 'userId', value })}
					required
				/>

				<CrmOrganizationTypeFormType
					value={typeId ? String(typeId) : undefined}
					onChange={(value) => handleSetValue({ field: 'typeId', value })}
					error={typeof typeIdErr === 'string' ? typeIdErr : undefined}
					onError={(value) => handleSetError({ field: 'typeId', value })}
					required
				/>

				<CrmOrganizationFormWebsite
					value={website}
					onChange={(value) => handleSetValue({ field: 'website', value })}
					error={typeof websiteErr === 'string' ? websiteErr : undefined}
					onError={(value) => handleSetError({ field: 'website', value })}
				/>

				<CrmPhonesForm
					value={phones}
					onChange={(value) => handleSetPhonesValue({ value })}
					error={phonesErr}
					data={contacts.flatMap((item) => item.phones)}
					onError={(value) => handleSetManyError({ field: 'phones', value })}
				/>

				<CrmEmailsForm
					value={emails}
					onChange={(value) => handleSetEmailsValue({ value })}
					error={emailsErr}
					data={contacts.flatMap((item) => item.emails)}
					onError={(value) => handleSetManyError({ field: 'emails', value })}
				/>

				<CrmOrganizationTagsForm
					value={tags}
					onChange={(value) => handleSetTagsValue({ value })}
					error={typeof tagsErr === 'string' ? tagsErr : undefined}
					onError={(value) => handleSetError({ field: 'tags', value })}
				/>

				<Divider className={css.divider} />

				<CrmOrganizationRequisiteCard
					data={requisites}
					onCreate={(value) => {
						handleSetRequisiteValue([...requisites, value]);
					}}
					onDelete={(value) => {
						handleSetRequisiteValue([...requisites.filter((item) => item.id !== value.id)]);
					}}
					onUpdate={(value) => {
						const oldData = [...requisites.filter((item) => item.id !== value.id)];
						handleSetRequisiteValue([...oldData, value]);
					}}
				/>

				<Divider className={css.divider} />

				<CrmContactsCardInfo
					data={contacts}
					onCreate={handleContactCreate}
					onConnect={handleContactConnect}
					onDisconnect={handleContactDisconnect}
					onUpdate={handleContactUpdate}
					dataPhones={phones}
					dataEmails={emails}
					displayWorkPosition
					displayPhones
				/>

				<Divider className={css.divider} />

				<CrmOrganizationFormComment
					value={comment}
					onChange={(value) => handleSetValue({ field: 'comment', value })}
					error={typeof commentErr === 'string' ? commentErr : undefined}
					onError={(value) => handleSetError({ field: 'comment', value })}
				/>
			</div>
		</>
	);
};
