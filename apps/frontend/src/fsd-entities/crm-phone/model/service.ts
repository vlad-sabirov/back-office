import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Const } from '../config/const';
import { IPhoneEntity } from '../entity';
import { IApiCreateDto, IApiFindByIdDto } from './service.types';

export const Api = createApi({
	reducerPath: `${Const.State.ReducerName}/api`,
	baseQuery: fetchBaseQuery({ baseUrl: '/api/crm/phone' }),
	endpoints: (builder) => ({
		findByPhone: builder.query<IPhoneEntity[], IApiFindByIdDto>({
			query: ({ phone, ignoreIds, ignorePhones }) => {
				const whereNot = [];
				if (ignoreIds) { whereNot.push(...ignoreIds.map((id) => ({ id }))); }
				if (ignorePhones) { whereNot.push(...ignorePhones.map((phone) => ({ value: phone }))); }

				return {
					url: '/findMany',
					method: 'POST',
					body: {
						where: {
							value: phone,
							NOT: whereNot
						},
					}
				}
			},
		}),
		add: builder.mutation<IPhoneEntity, IApiCreateDto>({
			query: (createDto) => ({ url: '/', method: 'POST', body: createDto})
		}),
		delete: builder.mutation<IPhoneEntity, { id: number | string }>({
			query: ({ id }) => ({ url: '/byId/' + id, method: 'DELETE'})
		}),
	}),
});

export const Service = {
	findByPhone: Api.useLazyFindByPhoneQuery,
	add: Api.useAddMutation,
	create: Api.useAddMutation,
	delete: Api.useDeleteMutation,
}
