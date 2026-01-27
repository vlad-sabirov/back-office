import { useCallback } from 'react';
import { useValidateCrmEmailsForm } from '@fsd/entities/crm-email';
import {
	useCrmOrganizationCommentValidation,
	useCrmOrganizationFormNameEnValidation,
	useCrmOrganizationFormNameRuValidation,
	useCrmOrganizationUserIdValidation,
	useCrmOrganizationWebsiteValidation,
} from '@fsd/entities/crm-organization';
import { useCrmOrganizationTagsFormValidation } from '@fsd/entities/crm-organization-tag';
import { useCrmOrganizationTypeFormValidation } from '@fsd/entities/crm-organization-type';
import { useValidateCrmPhonesForm } from '@fsd/entities/crm-phone';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { useActions } from '../../../../lib/use-actions';
import { IInitErrorUpdateOrganization } from '../../../../model/slice/org-card-info.slice.types';

type IHandleSetError = { [key in keyof IInitErrorUpdateOrganization]?: IInitErrorUpdateOrganization[key] };
export const useValidate = () => {
	const formNameRu = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.nameRu);
	const errNameRu = useStateSelector((state) => state.crm_organization_card_info.errors.updateOrganization.nameRu);
	const formNameEn = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.nameEn);
	const errNameEn = useStateSelector((state) => state.crm_organization_card_info.errors.updateOrganization.nameEn);
	const formUserId = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.userId);
	const errUserId = useStateSelector((state) => state.crm_organization_card_info.errors.updateOrganization.userId);
	const formTypeId = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.typeId);
	const errTypeId = useStateSelector((state) => state.crm_organization_card_info.errors.updateOrganization.typeId);
	const formPhones = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.phones);
	const errPhones = useStateSelector((state) => state.crm_organization_card_info.errors.updateOrganization.phones);
	const formEmails = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.emails);
	const errEmails = useStateSelector((state) => state.crm_organization_card_info.errors.updateOrganization.emails);
	const formWebsite = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.website);
	const errWebsite = useStateSelector((state) => state.crm_organization_card_info.errors.updateOrganization.website);
	const formTags = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.tags);
	const errTags = useStateSelector((state) => state.crm_organization_card_info.errors.updateOrganization.tags);
	const formComment = useStateSelector((state) => state.crm_organization_card_info.forms.updateOrganization.comment);
	const errComment = useStateSelector((state) => state.crm_organization_card_info.errors.updateOrganization.comment);
	const current = useStateSelector((state) => state.crm_organization.data.current);
	const actions = useActions();

	const handleSetError = useCallback(
		(fields: IHandleSetError) => {
			actions.setErrorUpdateOrganization(fields);
		},
		[actions]
	);

	const validateNameRu = useCrmOrganizationFormNameRuValidation({
		value: formNameRu,
		error: errNameRu,
		onChange: () => null,
		onError: (nameRu) => handleSetError({ nameRu }),
		required: true,
	});

	const validateNameEn = useCrmOrganizationFormNameEnValidation({
		value: formNameEn,
		error: errNameEn,
		onChange: () => null,
		onError: (nameEn) => handleSetError({ nameEn }),
		required: true,
	});

	const validateUserId = useCrmOrganizationUserIdValidation({
		value: formUserId,
		error: errUserId,
		onChange: () => null,
		onError: (value) => handleSetError({ userId: value }),
		required: true,
	});

	const validateTypeId = useCrmOrganizationTypeFormValidation({
		value: formTypeId,
		error: errTypeId,
		onChange: () => null,
		onError: (value) => handleSetError({ typeId: value }),
		required: true,
	});

	const validatePhones = useValidateCrmPhonesForm({
		value: formPhones,
		error: errPhones,
		onChange: () => null,
		onError: (value) => handleSetError({ phones: value }),
		ignorePhones: current?.phones?.map(({ value }) => value) || [],
	});

	const validateEmails = useValidateCrmEmailsForm({
		value: formEmails,
		error: errEmails,
		onChange: () => null,
		onError: (value) => handleSetError({ emails: value }),
		ignoreEmails: current?.emails?.map(({ value }) => value) || [],
	});

	const validateWebsite = useCrmOrganizationWebsiteValidation({
		value: formWebsite,
		error: errWebsite,
		onChange: () => null,
		onError: (value) => handleSetError({ website: value }),
	});

	const validateTags = useCrmOrganizationTagsFormValidation({
		value: formTags,
		error: errTags,
		onChange: () => null,
		onError: (value) => handleSetError({ tags: value }),
	});

	const validateComment = useCrmOrganizationCommentValidation({
		value: formComment,
		error: errComment,
		onChange: () => null,
		onError: (value) => handleSetError({ comment: value }),
	});

	return useCallback(async (): Promise<boolean> => {
		if (!(await validateNameEn())) {
			return false;
		}
		if (!(await validateNameRu())) {
			return false;
		}
		if (!(await validateUserId())) {
			return false;
		}
		if (!(await validateTypeId())) {
			return false;
		}
		if (!(await validatePhones())) {
			return false;
		}
		if (!(await validateEmails())) {
			return false;
		}
		if (!(await validateWebsite())) {
			return false;
		}
		if (!(await validateTags())) {
			return false;
		}
		if (!(await validateComment())) {
			return false;
		}
		return true;
	}, [
		validateComment,
		validateEmails,
		validateNameRu,
		validateNameEn,
		validatePhones,
		validateTags,
		validateTypeId,
		validateUserId,
		validateWebsite,
	]);
};
