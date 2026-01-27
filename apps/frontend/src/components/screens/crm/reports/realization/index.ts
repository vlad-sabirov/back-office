import { lazy } from 'react';

export const CrmReportRealization = lazy(() => import('./Realization.screen'));
export { ReportRealizationContext } from './Realization.screen';

export * from './cfg';
export * from './charts';
export * from './components';
export * from './modals';
