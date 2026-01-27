// Config
export { ACCESS as CRM_REALIZATION_PAGE_ACCESS } from './config/constants';
export { CONFIG as CRM_REALIZATION_PAGE_CONFIG } from './config/constants';

// Model
export { ReportRealizationSliceReducer as CrmReportRealizationPageReducer } from './model/report-realization.slice';
export type { IInitialStateFormPlanCreate as ICrmReportInitialStateFormPlanCreate } from './model/initial.types';

// Lib
export { useActions as useCrmRealizationActionsPage } from './libs';

// UI
export { Page as CrmReportRealization } from './ui/_main/PageAsync';
