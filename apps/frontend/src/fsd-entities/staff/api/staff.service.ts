import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Const } from '../const';
import { IStaffEntity } from '../staff.entity';

export const StaffApi = createApi({
	reducerPath: `${Const.State.ReducerName}/api`,
	baseQuery: fetchBaseQuery({ baseUrl: '/api/user' }),
	endpoints: (builder) => ({
		getAll: builder.query<IStaffEntity[], void>({
			query: () => ({ url: '/find/' }),
		}),
		getEverything: builder.query<IStaffEntity[], void>({
			query: () => ({ url: '/find/everything' }),
		}),
		getByIdMany: builder.query<IStaffEntity[], (string | number)[]>({
			query: (userIds) => ({ url: '/find/byIdMany', params: { userIds } }),
		}),
		getSales: builder.query<IStaffEntity[], void>({
			query: () => ({ url: '/find/department/sales' }),
		}),
	}),
});

export const StaffService = {
	getAll: StaffApi.useLazyGetAllQuery,
	getEverything: StaffApi.useLazyGetEverythingQuery,
	getByIdMany: StaffApi.useLazyGetByIdManyQuery,
	getSales: StaffApi.useLazyGetSalesQuery,
};
