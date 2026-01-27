import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { CrmOrganizationTypeConst as Const } from '../const/crm-organization-type.const';
import { ICrmOrganizationTypeEntity } from '../types/crm-organization-type.entity';
import {
	ICrmOrganizationTypeApiAdd,
	ICrmOrganizationTypeApiEdit,
	ICrmOrganizationTypeApiGet
} from '../types/crm-organization-type.service';

export const CrmOrganizationTypeApi = createApi({
	reducerPath: `${Const.State.ReducerName}/api`,
	baseQuery: fetchBaseQuery({ baseUrl: '/api/crm/organization-type' }),
	tagTypes: ['typeList'],
	endpoints: (builder) => ({
		// Получение базового списка
		getList: builder.query<ICrmOrganizationTypeEntity[], void>({
			providesTags: ['typeList'],
			query: () => ({
				url: '/findMany',
				method: 'POST',
				body: {
					where: {},
					// include: {},
					filter: { orderBy: { name: 'asc' } },
				}
			}),
		}),

		// Поиск
		getById: builder.query<ICrmOrganizationTypeEntity, number | string>({
			query: (id) => ({ url: '/byId/' + id, method: 'GET' }),
		}),
		getOnce: builder.query<ICrmOrganizationTypeEntity, ICrmOrganizationTypeApiGet>({
			query: ({ where, include, filter }) => ({
				url: '/findOnce',
				method: 'POST',
				body: { where, include, filter }
			}),
		}),
		getMany: builder.query<ICrmOrganizationTypeEntity[], ICrmOrganizationTypeApiGet>({
			query: ({ where, include, filter }) => ({
				url: '/findMany',
				method: 'POST',
				body: { where, include, filter }
			}),
		}),

		// Создание, изменение и удаление
		createType: builder.mutation<ICrmOrganizationTypeEntity, ICrmOrganizationTypeApiAdd>({
			invalidatesTags: ['typeList'],
			query: (body) => ({ url: '/', method: 'POST', body }),
		}),
		updateType: builder.mutation<ICrmOrganizationTypeEntity, ICrmOrganizationTypeApiEdit>({
			invalidatesTags: ['typeList'],
			query: ({ id, updateDto }) => ({ url: '/byId/' + id, method: 'PATCH', body: updateDto }),
		}),
		deleteType: builder.mutation<ICrmOrganizationTypeEntity, { id: number | string }>({
			invalidatesTags: ['typeList'],
			query: ({ id }) => ({ url: '/byId/' + id, method: 'DELETE' }),
		}),
	}),
});

export const CrmOrganizationTypeService = {
	getList: CrmOrganizationTypeApi.useLazyGetListQuery,
	getById: CrmOrganizationTypeApi.useLazyGetByIdQuery,
	getOnce: CrmOrganizationTypeApi.useLazyGetOnceQuery,
	createType: CrmOrganizationTypeApi.useCreateTypeMutation,
	updateType: CrmOrganizationTypeApi.useUpdateTypeMutation,
	deleteType: CrmOrganizationTypeApi.useDeleteTypeMutation,
}
