import { IBuildMonthByDateReq, ICreateMonthRealizationReq, IUpdateMonthRealizationReq } from './req';
import { IMonthRes } from './res';
import { IResponseError } from '@fsd/shared/store/types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const RealizationApi = createApi({
	reducerPath: `crm_realization_api/api`,
	baseQuery: fetchBaseQuery({ baseUrl: '/api/account_1c' }),
	tagTypes: ['current', 'monthAll', 'monthAllMy'],
	endpoints: (builder) => ({
		getMonthAll: builder.query<IMonthRes[], void>({
			query: () => ({ url: '/realization/month/all' }),
			providesTags: ['monthAll'],
		}),
		buildMonthByDate: builder.mutation<IMonthRes, IBuildMonthByDateReq>({
			query: (body) => ({ url: `/realization/month/build/byDate`, method: 'PUT', body }),
			invalidatesTags: ['monthAll'],
		}),
		create: builder.mutation<IMonthRes | IResponseError, ICreateMonthRealizationReq>({
			query: (body) => ({ url: '/realization/month/', method: 'POST', body }),
			invalidatesTags: ['monthAll'],
		}),
		updateMonth: builder.mutation<IMonthRes | IResponseError, IUpdateMonthRealizationReq>({
			query: (body) => ({ url: '/realization/month/', method: 'PUT', body }),
			invalidatesTags: ['monthAll'],
		}),
	}),
});

export const RealizationService = {
	getMonthAll: RealizationApi.useLazyGetMonthAllQuery,
	buildMonthByDate: RealizationApi.useBuildMonthByDateMutation,
	createMonth: RealizationApi.useCreateMutation,
	updateMonth: RealizationApi.useUpdateMonthMutation,
};
