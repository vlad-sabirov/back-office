import { IAnalyticsDto } from './req/analytics.dto';
import { ICallHangupDto } from './req/call-hangup.dto';
import { ICallMicDto } from './req/call-mic.dto';
import { ICallMorphP2PToConferenceDto } from './req/call-morph-p2p-to-conference.dto';
import { IConferenceAddDto } from './req/conference-add.dto';
import { IConferenceCreateDto } from './req/conference-create.dto';
import { IMissingCallsCheckDto } from './req/missing-calls-check.dto';
import { IMissingCallsDto } from './req/missing-calls.dto';
import { IP2PCreateDto } from './req/p2p-create.dto';
import { IP2PRedirectDto } from './req/p2p-redirect.dto';
import { IRecordingsDto } from './req/recordings.dto';
import { IAnalyticsResponse } from './res/analytics.res';
import { ICallMicResponse } from './res/call-mic.res';
import { ICallerConferenceResponse } from './res/conference.res';
import { IMissingCallsCheckResponse } from './res/missing-calls-check.res';
import { IMissingCallsResponse } from './res/missing-calls.res';
import { IP2PRedirectResponse } from './res/p2p-redirect.res';
import { ICallerP2PResponse } from './res/p2p.res';
import { IRecordingsResponse } from './res/recordings.res';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const VoipApi = createApi({
	reducerPath: `voip/api`,
	baseQuery: fetchBaseQuery({ baseUrl: '/api/voip' }),
	endpoints: (builder) => ({
		p2pCreate: builder.query<ICallerP2PResponse, IP2PCreateDto>({
			query: (body) => ({ url: '/p2p/create', method: 'POST', body }),
		}),
		p2pRedirect: builder.query<IP2PRedirectResponse, IP2PRedirectDto>({
			query: (body) => ({ url: '/p2p/redirect', method: 'PATCH', body }),
		}),
		conferenceCreate: builder.query<ICallerConferenceResponse, IConferenceCreateDto>({
			query: (body) => ({ url: '/conference/create', method: 'POST', body }),
		}),
		conferenceAdd: builder.query<ICallerConferenceResponse, IConferenceAddDto>({
			query: (body) => ({ url: '/conference/add', method: 'PATCH', body }),
		}),
		callMic: builder.query<ICallMicResponse, ICallMicDto>({
			query: (body) => ({ url: '/call/mic', method: 'PATCH', body }),
		}),
		callHangup: builder.query<ICallerP2PResponse, ICallHangupDto>({
			query: (body) => ({ url: '/call/hangup', method: 'PATCH', body }),
		}),
		callMorphP2PToConference: builder.query<ICallerConferenceResponse, ICallMorphP2PToConferenceDto>({
			query: (body) => ({ url: '/call/morph-p2p-to-conference', method: 'PUT', body }),
		}),
		analytics: builder.query<IAnalyticsResponse, IAnalyticsDto>({
			query: (body) => ({ url: '/analytics', method: 'POST', body }),
		}),
		missingCalls: builder.query<IMissingCallsResponse[], IMissingCallsDto>({
			query: (body) => ({ url: '/analytics/missing', method: 'POST', body }),
		}),
		missingCallCheck: builder.query<IMissingCallsCheckResponse, IMissingCallsCheckDto>({
			query: (body) => ({ url: '/analytics/missing/check', method: 'PATCH', body }),
		}),
		recordings: builder.query<IRecordingsResponse[], IRecordingsDto>({
			query: (body) => ({ url: '/analytics/recording', method: 'POST', body }),
		}),
	}),
});

export const VoipService = {
	p2pCreate: VoipApi.useLazyP2pCreateQuery,
	p2pRedirect: VoipApi.useLazyP2pRedirectQuery,
	conferenceCreate: VoipApi.useLazyConferenceCreateQuery,
	conferenceAdd: VoipApi.useLazyConferenceAddQuery,
	callHangup: VoipApi.useLazyCallHangupQuery,
	callMic: VoipApi.useLazyCallMicQuery,
	callMorphP2PToConference: VoipApi.useLazyCallMorphP2PToConferenceQuery,
	analytics: VoipApi.useLazyAnalyticsQuery,
	missingCalls: VoipApi.useLazyMissingCallsQuery,
	missingCallCheck: VoipApi.useLazyMissingCallCheckQuery,
	recording: VoipApi.useLazyRecordingsQuery,
};
