import { useCallback } from 'react';
import { useValidateCrmEmailsForm } from '@fsd/entities/crm-email';
import {
	useCrmOrganizationCommentValidation,
	useCrmOrganizationFormFirstDocumentValidation,
	useCrmOrganizationFormNameEnValidation,
	useCrmOrganizationFormNameRuValidation,
	useCrmOrganizationUserIdValidation,
	useCrmOrganizationWebsiteValidation,
} from '@fsd/entities/crm-organization';
import { useCrmOrganizationTagsFormValidation } from '@fsd/entities/crm-organization-tag';
import { useCrmOrganizationTypeFormValidation } from '@fsd/entities/crm-organization-type';
import { useValidateCrmPhonesForm } from '@fsd/entities/crm-phone';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { useActions } from '../useActions/useActions';

export const useValidate = () => {
	const actions = useActions();

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

	const validateNameRu = useCrmOrganizationFormNameRuValidation({
		value: nameRu,
		error: typeof nameRuErr === 'string' ? nameRuErr : undefined,
		onChange: (nameRu) => actions.setValues({ nameRu }),
		onError: (nameRu) => actions.setErrors({ nameRu }),
		required: true,
	});

	const validateNameEn = useCrmOrganizationFormNameEnValidation({
		value: nameEn,
		error: typeof nameEnErr === 'string' ? nameEnErr : undefined,
		onChange: (nameEn) => actions.setValues({ nameEn }),
		onError: (nameEn) => actions.setErrors({ nameEn }),
		required: true,
	});

	const validateFirstDocument = useCrmOrganizationFormFirstDocumentValidation({
		value: firstDocument,
		error: typeof firstDocumentErr === 'string' ? firstDocumentErr : undefined,
		onChange: (firstDocument) => actions.setValues({ firstDocument }),
		onError: (firstDocument) => actions.setErrors({ firstDocument }),
		required: true,
	});

	const validateUserId = useCrmOrganizationUserIdValidation({
		value: userId + '',
		error: typeof userIdErr === 'string' ? userIdErr : undefined,
		onChange: (userId) => actions.setValues({ userId }),
		onError: (userId) => actions.setErrors({ userId }),
		required: true,
	});

	const validateType = useCrmOrganizationTypeFormValidation({
		value: typeId + '',
		error: typeof typeIdErr === 'string' ? typeIdErr : undefined,
		onChange: (typeId) => actions.setValues({ typeId }),
		onError: (typeId) => actions.setErrors({ typeId }),
		required: true,
	});

	const validateWebsite = useCrmOrganizationWebsiteValidation({
		value: website,
		error: typeof websiteErr === 'string' ? websiteErr : undefined,
		onChange: (website) => actions.setValues({ website }),
		onError: (website) => actions.setErrors({ website }),
	});

	const validatePhones = useValidateCrmPhonesForm({
		value: phones,
		error: typeof phonesErr === 'string' ? phonesErr : undefined,
		onChange: (phones) => actions.setValues({ phones }),
		onError: (phones) => actions.setErrors({ phones }),
	});

	const validateEmails = useValidateCrmEmailsForm({
		value: emails,
		error: typeof emailsErr === 'string' ? emailsErr : undefined,
		onChange: (emails) => actions.setValues({ emails }),
		onError: (emails) => actions.setErrors({ emails }),
	});

	const validateTag = useCrmOrganizationTagsFormValidation({
		value: tags,
		error: typeof tagsErr === 'string' ? tagsErr : undefined,
		onChange: (tags) => actions.setValues({ tags }),
		onError: (tags) => actions.setErrors({ tags: tags as undefined }),
	});

	const validateComment = useCrmOrganizationCommentValidation({
		value: comment,
		error: typeof commentErr === 'string' ? commentErr : undefined,
		onChange: (comment) => actions.setValues({ comment }),
		onError: (comment) => actions.setErrors({ comment }),
	});

	return useCallback(async () => {
		if (!(await validateNameRu())) {
			return false;
		}
		if (!(await validateNameEn())) {
			return false;
		}
		if (!(await validateFirstDocument())) {
			return false;
		}
		if (!(await validateUserId())) {
			return false;
		}
		if (!(await validateType())) {
			return false;
		}
		if (!(await validateWebsite())) {
			return false;
		}
		if (!(await validatePhones())) {
			return false;
		}
		if (!(await validateEmails())) {
			return false;
		}
		if (!(await validateTag())) {
			return false;
		}
		if (!(await validateComment())) {
			return false;
		}
		return true;
	}, [
		validateEmails,
		validateFirstDocument,
		validateNameRu,
		validateNameEn,
		validatePhones,
		validateType,
		validateUserId,
		validateWebsite,
		validateTag,
		validateComment,
	]);
};
