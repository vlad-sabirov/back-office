// Entity
export type { ICrmTaskEntity, ICrmTaskFormEntity } from './entity';
export { EnCrmTaskStatus, EnCrmTaskPriority } from './entity';

// Config
export { Const as CrmTaskConst } from './config/const';

// Model
export { CrmTaskApi, CrmTaskService } from './model/service';
export { CrmTaskReducer, CrmTaskActions, initialState as CrmTaskInitialState } from './model/slice';
export type { ICrmTaskReducer } from './model/slice';
