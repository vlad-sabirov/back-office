import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { ITagApiAdd, ITagApiEdit, ITagApiGet } from './tag.types';
import { Const } from "../../config/const";
import { ITagEntity } from "../../tag.entity";

export const TagApi = createApi({
	reducerPath: `${Const.State.ReducerName}/api`,
	baseQuery: fetchBaseQuery({ baseUrl: '/api/crm/organization-tag' }),
	tagTypes: ['list', 'current'],
	endpoints: (builder) => ({
		// Получение базового списка
		getList: builder.query<ITagEntity[], void>({
			providesTags: ['list'],
			query: () => ({
				url: '/findMany',
				method: 'POST',
				body: {
					where: {},
					include: { organizations: true },
					filter: { orderBy: { name: 'asc' } },
				}
			}),
		}),

		// Поиск
		getById: builder.query<ITagEntity, number | string>({
			query: (id) => ({ url: '/byId/' + id, method: 'GET' }),
		}),
		getOnce: builder.query<ITagEntity, ITagApiGet>({
			query: ({ where, include, filter }) => ({
				url: '/findOnce',
				method: 'POST',
				body: { where, include, filter }
			}),
		}),
		getMany: builder.query<ITagEntity[], ITagApiGet>({
			query: ({ where, include, filter }) => ({
				url: '/findMany',
				method: 'POST',
				body: { where, include, filter }
			}),
		}),

		// Создание, изменение и удаление
		create: builder.mutation<ITagEntity, ITagApiAdd>({
			invalidatesTags: ['list', 'current'],
			query: (body) => ({ url: '/', method: 'POST', body }),
		}),
		updateTag: builder.mutation<ITagEntity, ITagApiEdit>({
			invalidatesTags: ['list', 'current'],
			query: ({ id, updateDto }) => ({ url: '/byId/' + id, method: 'PATCH', body: updateDto }),
		}),
		deleteTag: builder.mutation<ITagEntity, { id: number | string }>({
			invalidatesTags: ['list', 'current'],
			query: ({ id }) => ({ url: '/byId/' + id, method: 'DELETE' }),
		}),
	}),
});

export const TagService = {
	getList: TagApi.useLazyGetListQuery,
	getById: TagApi.useLazyGetByIdQuery,
	getOnce: TagApi.useLazyGetOnceQuery,
	create: TagApi.useCreateMutation,
	update: TagApi.useUpdateTagMutation,
	delete: TagApi.useDeleteTagMutation,
}
