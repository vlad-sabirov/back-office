// config
export { Types as CrmCardTypes } from './config/enums';

// store
export { Actions as CrmCardActions, Reducer as CrmCardReducer } from './model/crm-model.slice';

// lib
export { useActions as useCrmCardActions } from './lib/useActions/useActions';
export { useShowDrawer as useCrmCardShowDrawer } from './lib/useShowDrawer/useShowDrawer';
export { useShowContact as useCrmCardShowContact } from './lib/useShowDrawer/useShowContact';
export { useShowOrganization as useCrmCardShowOrganization } from './lib/useShowDrawer/useShowOrganization';
