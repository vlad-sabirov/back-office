import { IWorkingBaseRes } from './res';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const WorkingBaseApi = createApi({
	reducerPath: `crm_working_base/api`,
	baseQuery: fetchBaseQuery({ baseUrl: '/api/account_1c/working-base' }),
	endpoints: (builder) => ({
		getAll: builder.query<IWorkingBaseRes[], void>({
			query: () => ({ url: '' }),
		}),
	}),
});

export const WorkingBaseService = {
	getAll: WorkingBaseApi.useLazyGetAllQuery,
};
