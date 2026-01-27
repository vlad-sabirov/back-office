/* eslint-disable max-len */

// Config
export { COLORS as CRM_REALIZATION_COLORS } from './config/constants';
export { ACCESS as CRM_REALIZATION_ACCESS } from './config/constants';
export { CONFIG as CRM_REALIZATION_CONFIG } from './config/constants';

// Model
export { RealizationSliceReducer as CrmRealizationSliceReducer } from './model/realization.slice';
export { RealizationService as CrmRealizationService } from './api/realization-api';
export { RealizationApi as CrmRealizationApi } from './api/realization-api';

// Types
export type { ILinkedListAll as ICrmRealizationLinkedListAll } from './lib/linked-list/types.linked-list';
export type { ILinkedListAllValue as ICrmRealizationLinkedListAllValue } from './lib/linked-list/types.linked-list';
export type { ILinkedListTeamValue as ICrmRealizationLinkedListTeamValue } from './lib/linked-list/types.linked-list';
export type { ILinkedListEmployeeValue as ICrmRealizationLinkedListEmployeeValue } from './lib/linked-list/types.linked-list';
export type { IMonthRes as ICrmRealizationMonthResAll } from './api/res/month.res';
export type { IMonthResTeam as ICrmRealizationMonthResTeam } from './api/res/month-team.res';
export type { IMonthResEmployee as ICrmRealizationMonthResEmployee } from './api/res/month-employee.res';

// Lib
export { useActions as useCrmRealizationActions } from './lib';
export { useBuildMonth as useCrmRealizationBuildMonth } from './lib';
export { useStateConfigure as useCrmRealizationStateConfigure } from './lib';
export { useGetDataMonthAll as useCrmRealizationGetDataMonthAll } from './lib';
