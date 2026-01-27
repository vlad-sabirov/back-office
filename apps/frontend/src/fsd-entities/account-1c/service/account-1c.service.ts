import { ILastUpdateDto } from './dto';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const Account1CApi = createApi({
	reducerPath: `account-1c/api`,
	baseQuery: fetchBaseQuery({ baseUrl: '/api/account_1c/last-action' }),
	endpoints: (builder) => ({
		getLastUpdate: builder.query<void, ILastUpdateDto>({
			query: ({ organizationId }) => ({ url: '/byOrganizationId', method: 'GET', params: { organizationId } }),
		}),
	}),
});

export const Account1CService = {
	getLastUpdate: Account1CApi.useLazyGetLastUpdateQuery,
};
