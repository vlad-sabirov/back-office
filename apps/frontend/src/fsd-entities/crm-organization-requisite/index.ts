/* eslint-disable max-len */

// Entity
export type { IRequisiteEntity as ICrmOrganizationRequisiteEntity } from './requisite.entity';
export type { IRequisiteSliceFormEntity as ICrmOrganizationRequisiteFormEntity } from './model/slice/requisite-slice.types';

// Model
export { RequisiteReducer as CrmOrganizationRequisiteReducer } from './model/slice/requisite.slice';
export { requisiteApi as CrmOrganizationRequisiteApi } from './model/service/requisite.service'
export { requisiteService as CrmOrganizationRequisiteService } from './model/service/requisite.service'

// Lib
export { useActions as useCrmOrganizationRequisiteActions } from './lib/use-actions';

// UI
export { RequisiteCard as CrmOrganizationRequisiteCard } from '@fsd/entities/crm-organization-requisite/ui/requisite-card/RequisiteCard';
