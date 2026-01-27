/* eslint-disable max-len */

// Model
export { WorkingBaseSliceReducer as CrmWorkingBaseSliceReducer } from './model/working-base.slice';
export { WorkingBaseService as CrmWorkingBaseService } from './api/working-base-api';
export { WorkingBaseApi as CrmWorkingBaseApi } from './api/working-base-api';

// Lib
export { diff as crmWorkingDiff } from './lib';
export { useDiff as useCrmWorkingDiff } from './lib';
export { useStateConfigure as useCrmWorkingBaseStateConfigure } from './lib';

// Types
export type { IWorkingBaseUserRes as ICrmWorkingBaseUserRes } from './api/res/working-base.res';
