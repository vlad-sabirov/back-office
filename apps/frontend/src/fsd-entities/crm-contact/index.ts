// Entity
export type { ICrmContactEntity } from './entity';

// Config
export { Const as CrmContactConst } from './config/const';

// Model
export { CrmContactApi, CrmContactService } from './model/service';
export { CrmContactReducer, CrmContactActions } from './model/slice';
export type { IAddContactForm as ICrmContactAddForm } from './model/slice.types';

// Hooks
export { useActions as useCrmContactActions } from './lib/useActions/useActions';
export { useGetByID as useCrmContactGetByID } from './lib/useGetByID/useGetByID';
export { useGetCurrent as useCrmContactGetCurrent } from './lib/useGetCurrent/useGetCurrent';
export { useStoreConfigure as useStoreConfigureContact } from './lib/useStoreConfigure/useStoreConfigure';

// UI
export { FormBirthday as CrmContactFormBirthday } from './ui/form-birthday/FormBirthday';
export { useValidate as useValidateCrmContactFormBirthday } from './ui/form-birthday/useValidate';
export { FormComment as CrmContactFormComment } from './ui/form-comment/FormComment';
export { FormColor as CrmContactFormColor } from './ui/form-color/FormColor';
export { useValidate as useValidateCrmContactFormComment } from './ui/form-comment/useValidate';
export { FormName as CrmContactFormName } from './ui/form-name/FormName';
export { useValidate as useValidateCrmContactFormName } from './ui/form-name/useValidate';
export { FormUserId as CrmContactFormUserId } from './ui/form-user-id/FormUserId';
export { useValidate as useValidateCrmContactFormUserId } from './ui/form-user-id/useValidate';
export { WorkPosition as CrmContactFormWorkPosition } from './ui/form-work-position/WorkPosition';
export { useValidate as useValidateCrmContactFormWorkPosition } from './ui/form-work-position/useValidate';
export { ModalEdit as CrmContactModalEdit } from './ui/modal-edit/ModalEdit';
export { ModalUserId as CrmContactModalUserId } from './ui/modal-user-id/ModalUserId';
