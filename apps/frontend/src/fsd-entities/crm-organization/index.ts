export * from './entity';
export { CrmOrganizationConst } from './config/const';
export { CrmOrganizationApi, CrmOrganizationService } from './model/service';
export { CrmOrganizationReducer, CrmOrganizationActions } from './model/slice';

// Hooks
export { useActions as useCrmOrganizationActions } from './lib/useActions/useActions';
export { useGetByID as useCrmOrganizationGetByID } from 'fsd-entities/crm-organization/lib/useGetByID/useGetByID';
export { useGetCurrent as useCrmOrganizationGetCurrent } from './lib/useGetCurrent/useGetCurrent';
export { useStoreConfigure as useStoreConfigureOrganization } from './lib/useStoreConfigure/useStoreConfigure';

// UI
export { IconBattery as CrmOrganizationIconBattery } from './ui/icon-battery/IconBattery';
export { FormNameRu as CrmOrganizationFormNameRu } from './ui/form-name-ru/FormNameRu';
export { useValidate as useCrmOrganizationFormNameRuValidation } from './ui/form-name-ru/useValidate';
export { FormNameEn as CrmOrganizationFormNameEn } from './ui/form-name-en/FormNameEn';
export { useValidate as useCrmOrganizationFormNameEnValidation } from './ui/form-name-en/useValidate';
export { FormFirstDocument as CrmOrganizationFormFirstDocument } from './ui/form-first-document/FormFirstDocument';
export { useValidate as useCrmOrganizationFormFirstDocumentValidation } from './ui/form-first-document/useValidate';
export { FormUserId as CrmOrganizationFormUserId } from './ui/form-user-id/FormUserId';
export { useValidate as useCrmOrganizationUserIdValidation } from './ui/form-user-id/useValidate';
export { FormWebsite as CrmOrganizationFormWebsite } from './ui/form-website/FormWebsite';
export { useValidate as useCrmOrganizationWebsiteValidation } from './ui/form-website/useValidate';
export { FormComment as CrmOrganizationFormComment } from './ui/form-comment/FormComment';
export { useValidate as useCrmOrganizationCommentValidation } from './ui/form-comment/useValidate';
