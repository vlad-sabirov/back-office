// Model
export { VoipSliceReducer } from './model/voip.slice';
export { VoipService, VoipApi } from './api/voip-api';

// Lib
export { useWsClient as useVoipWsClient } from './lib';
export { useCallP2P } from './lib';
export { useCheckMyCall as useVoipCheckMyCall } from './lib';
export { useActions as useVoipActions } from './lib';
export { useStateConfigure as useVoipStateConfigure } from './lib';

// Types
export type { IMissingCallsResponse as IVoipMissingCallsResponse } from './api/res/missing-calls.res';

// UI
export { HeaderPopup as VoipHeaderPopup } from './ui/_header-popup/HeaderPopup';
export { CallTo } from './ui/call-to/CallTo';
