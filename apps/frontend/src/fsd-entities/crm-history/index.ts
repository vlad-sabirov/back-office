// Entity
export * from './entity';

// Config
export { Const as CrmHistoryConst } from './config/const';

// Api
export { Api as CrmHistoryApi } from './api/service';
export { Service as CrmHistoryService } from './api/service';

// Model
export { Reducer as CrmHistoryReducer } from './model/slice';

// Hooks
export { useActions as useCrmHistoryActions } from './lib/useActions/useActions';
export { useFeed as useCrmHistoryFeed } from './lib/useFeed/useFeed';
