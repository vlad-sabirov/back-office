import { CrmContactCardInfoReducer } from 'fsd-features/crm-contacts-card-info__new';
import { CrmOrganizationsCardInfoReducer } from 'fsd-features/crm-organizations-card-info';
import { createWrapper } from 'next-redux-wrapper';
import { Account1CApi } from '@fsd/entities/account-1c';
import { AppReducer } from '@fsd/entities/app';
import { CrmCardReducer } from '@fsd/entities/crm-card';
import { CrmContactApi, CrmContactReducer } from '@fsd/entities/crm-contact';
import { CrmEmailApi } from '@fsd/entities/crm-email';
import { CrmHistoryApi, CrmHistoryReducer } from '@fsd/entities/crm-history';
import { CrmOrganizationApi, CrmOrganizationReducer } from '@fsd/entities/crm-organization';
import { CrmOrganizationRequisiteApi, CrmOrganizationRequisiteReducer } from '@fsd/entities/crm-organization-requisite';
import { CrmOrganizationTagApi, CrmOrganizationTagReducer } from '@fsd/entities/crm-organization-tag';
import { CrmOrganizationTypeApi, CrmOrganizationTypeReducer } from '@fsd/entities/crm-organization-type';
import { CrmPhoneApi } from '@fsd/entities/crm-phone';
import { CrmRealizationApi, CrmRealizationSliceReducer } from '@fsd/entities/crm-realization';
import { CrmWorkingBaseApi, CrmWorkingBaseSliceReducer } from '@fsd/entities/crm-working-base';
import { SearchReducer } from '@fsd/entities/search';
import { StaffApi, StaffReducer } from '@fsd/entities/staff';
import { TodoApi, TodoSliceReducer } from '@fsd/entities/todo';
import { VoipApi, VoipSliceReducer } from '@fsd/entities/voip';
import { CrmOrganizationCardInfoReducer } from '@fsd/features/crm-organization-card-info';
import { CrmReportRealizationPageReducer } from '@fsd/pages/crm-report-realization';
import { CrmOrganizationAddDrawerReducer } from '@fsd/widgets/crm-organization-add-drawer';
import { combineReducers, configureStore } from '@reduxjs/toolkit';

export const rootReducer = combineReducers({
	app: AppReducer,
	staff: StaffReducer,
	[StaffApi.reducerPath]: StaffApi.reducer,
	crm_organization: CrmOrganizationReducer,
	[CrmOrganizationApi.reducerPath]: CrmOrganizationApi.reducer,
	crm_organization_type: CrmOrganizationTypeReducer,
	[CrmOrganizationTypeApi.reducerPath]: CrmOrganizationTypeApi.reducer,
	crm_organization_tag: CrmOrganizationTagReducer,
	crm_organization_requisite: CrmOrganizationRequisiteReducer,
	[CrmOrganizationRequisiteApi.reducerPath]: CrmOrganizationRequisiteApi.reducer,
	[CrmOrganizationTagApi.reducerPath]: CrmOrganizationTagApi.reducer,
	crm_contact: CrmContactReducer,
	[CrmContactApi.reducerPath]: CrmContactApi.reducer,
	crm_contact_card_info: CrmContactCardInfoReducer,
	[CrmPhoneApi.reducerPath]: CrmPhoneApi.reducer,
	[CrmEmailApi.reducerPath]: CrmEmailApi.reducer,
	[CrmEmailApi.reducerPath]: CrmEmailApi.reducer,
	crm_card: CrmCardReducer,
	crm_organization_card_info: CrmOrganizationCardInfoReducer,
	crm_organizations_card_info: CrmOrganizationsCardInfoReducer,
	[CrmHistoryApi.reducerPath]: CrmHistoryApi.reducer,
	crm_history: CrmHistoryReducer,
	crm_organization_add_drawer: CrmOrganizationAddDrawerReducer,
	crm_realization: CrmRealizationSliceReducer,
	[CrmRealizationApi.reducerPath]: CrmRealizationApi.reducer,
	crm_realization_page: CrmReportRealizationPageReducer,
	crm_working_base: CrmWorkingBaseSliceReducer,
	[CrmWorkingBaseApi.reducerPath]: CrmWorkingBaseApi.reducer,
	search: SearchReducer,
	[Account1CApi.reducerPath]: Account1CApi.reducer,
	voip: VoipSliceReducer,
	[VoipApi.reducerPath]: VoipApi.reducer,
	todo: TodoSliceReducer,
	[TodoApi.reducerPath]: TodoApi.reducer,
});

export const ReduxStore = () =>
	configureStore({
		reducer: rootReducer,
		middleware: (getDefaultMiddleware) => {
			return getDefaultMiddleware({
				// serializableCheck: false,
			})
				.concat(StaffApi.middleware)
				.concat(CrmOrganizationApi.middleware)
				.concat(CrmOrganizationTypeApi.middleware)
				.concat(CrmOrganizationTagApi.middleware)
				.concat(CrmOrganizationRequisiteApi.middleware)
				.concat(CrmContactApi.middleware)
				.concat(CrmPhoneApi.middleware)
				.concat(CrmEmailApi.middleware)
				.concat(CrmHistoryApi.middleware)
				.concat(CrmRealizationApi.middleware)
				.concat(CrmWorkingBaseApi.middleware)
				.concat(Account1CApi.middleware)
				.concat(VoipApi.middleware)
				.concat(TodoApi.middleware);
		},
	});

export const wrapper = createWrapper(ReduxStore, { debug: true });
