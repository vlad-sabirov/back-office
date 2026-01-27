import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Const } from '../config/const';
import { IEmailEntity } from '../entity';
import { IApiCreateDto, IApiFindByIdDto } from './service.types';
export const Api = createApi({
	reducerPath: `${Const.State.ReducerName}/api`,
	baseQuery: fetchBaseQuery({ baseUrl: '/api/crm/email' }),
	endpoints: (builder) => ({
		findByEmail: builder.query<IEmailEntity[], IApiFindByIdDto>({
			query: ({ email, ignoreIds, ignoreEmails }) => {
				const whereNot = [];
				if (ignoreIds) { whereNot.push(...ignoreIds.map((id) => ({ id }))); }
				if (ignoreEmails) { whereNot.push(...ignoreEmails.map((email) => ({ value: email }))); }
				
				return {
					url: '/findMany',
					method: 'POST',
					body: {
						where: {
							value: email,
							NOT: whereNot
						},
					}
				}
			},
		}),
		add: builder.mutation<IEmailEntity, IApiCreateDto>({
			query: (createDto) => ({ url: '/', method: 'POST', body: createDto})
		}),
		delete: builder.mutation<IEmailEntity, { id: number | string }>({
			query: ({ id }) => ({ url: '/byId/' + id, method: 'DELETE'})
		}),
	}),
});

export const Service = {
	findByEmail: Api.useLazyFindByEmailQuery,
	add: Api.useAddMutation,
	create: Api.useAddMutation,
	delete: Api.useDeleteMutation,
}
