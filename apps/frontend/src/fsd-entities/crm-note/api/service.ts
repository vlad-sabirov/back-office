import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ICrmNoteEntity } from '../entity';

const Api = createApi({
	reducerPath: 'crm_note/api',
	baseQuery: fetchBaseQuery({
		baseUrl: '/api/crm/note',
		prepareHeaders: (headers) => {
			const token = localStorage.getItem('accessToken');
			if (token) headers.set('Authorization', `Bearer ${token}`);
			return headers;
		},
	}),
	tagTypes: ['notes'],
	endpoints: (builder) => ({
		getByOrganizationId: builder.query<ICrmNoteEntity[], number>({
			query: (id) => `/byOrganizationId/${id}`,
			providesTags: ['notes'],
		}),
		getLastByOrganizationId: builder.query<ICrmNoteEntity | null, number>({
			query: (id) => `/lastByOrganizationId/${id}`,
		}),
		create: builder.mutation<ICrmNoteEntity, { text: string; organizationId: number }>({
			query: (body) => ({ url: '/', method: 'POST', body }),
			invalidatesTags: ['notes'],
		}),
		update: builder.mutation<ICrmNoteEntity, { id: number; text: string }>({
			query: ({ id, text }) => ({ url: `/byId/${id}`, method: 'PATCH', body: { text } }),
			invalidatesTags: ['notes'],
		}),
		remove: builder.mutation<ICrmNoteEntity, number>({
			query: (id) => ({ url: `/byId/${id}`, method: 'DELETE' }),
			invalidatesTags: ['notes'],
		}),
	}),
});

export const CrmNoteService = {
	getByOrganizationId: Api.useLazyGetByOrganizationIdQuery,
	getLastByOrganizationId: Api.useLazyGetLastByOrganizationIdQuery,
	create: Api.useCreateMutation,
	update: Api.useUpdateMutation,
	remove: Api.useRemoveMutation,
};

export const CrmNoteApi = Api;
