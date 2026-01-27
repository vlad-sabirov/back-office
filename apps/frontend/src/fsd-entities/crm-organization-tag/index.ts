// Entity
export type { ITagEntity as ICrmOrganizationTagEntity } from './tag.entity';

// Model
export { TagApi as CrmOrganizationTagApi } from './model/service/tag.service';
export { TagService as CrmOrganizationTagService } from './model/service/tag.service';
export { TagReducer as CrmOrganizationTagReducer } from './model/slice/tag.slice';

// Lib
export { useStoreConfigure as useCrmStoreConfigureOrganizationTag } from './lib/use-store-configure'
export { useActions as useCrmOrganizationTagActions } from './lib/use-actions'

// UI
export { CardTags as CrmCardOrganizationTags } from './ui/card-tags/CardTags';
export { FormTags as CrmOrganizationTagsForm } from './ui/form-tags/FormTags';
export { useValidate as useCrmOrganizationTagsFormValidation } from './ui/form-tags/useValidate';
