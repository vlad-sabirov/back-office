import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { Const } from "../../config/const";
import { IRequisiteEntity } from "../../requisite.entity";

import {
	IRequisiteApiCreate,
	IRequisiteApiFindOnce, IRequisiteApiUpdate
} from "./requisite-service.types";

export const requisiteApi = createApi({
	reducerPath: `${Const.State.ReducerName}/api`,
	baseQuery: fetchBaseQuery({ baseUrl: '/api/crm/organization-requisite' }),
	tagTypes: ['list'],
	endpoints: (builder) => ({
		findOnce: builder.query<IRequisiteEntity, IRequisiteApiFindOnce>({
			query: (body) => {
				return {
					url: '/findOnce',
					method: 'POST',
					body
				}
			},
		}),
		create: builder.mutation<IRequisiteEntity, IRequisiteApiCreate>({
			invalidatesTags: ['list'],
			query: (createDto) => ({ url: '/', method: 'POST', body: createDto})
		}),
		update: builder.mutation<IRequisiteEntity, IRequisiteApiUpdate>({
			invalidatesTags: ['list'],
			query: ({ id, ...updateDto }) => ({ url: `/byId/${id}`, method: 'PATCH', body: updateDto})
		}),
		deleteById: builder.mutation<IRequisiteEntity, string | number>({
			invalidatesTags: ['list'],
			query: (id) => ({ url: `/byId/${id}`, method: 'DELETE'})
		}),
	}),
});

export const requisiteService = {
	findOnce: requisiteApi.useLazyFindOnceQuery,
	create: requisiteApi.useCreateMutation,
	updateById: requisiteApi.useUpdateMutation,
	deleteById: requisiteApi.useDeleteByIdMutation,
}
