import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Const } from '../config/const';
import { ICrmTaskEntity, ICrmTaskFormEntity } from '../entity';

interface IFindManyRequest {
	where?: {
		id?: number;
		title?: string;
		status?: string | string[];
		priority?: string | string[];
		authorId?: number;
		assigneeId?: number;
		organizationId?: number;
	};
	filter?: {
		orderBy?: Record<string, 'asc' | 'desc'>;
		take?: number;
		skip?: number;
	};
	include?: Record<string, boolean>;
}

export const CrmTaskApi = createApi({
	reducerPath: `${Const.State.ReducerName}/api`,
	baseQuery: fetchBaseQuery({ baseUrl: '/api/crm/task' }),
	tagTypes: ['current', 'list', 'my'],
	endpoints: (builder) => ({
		// Найти много
		findMany: builder.query<ICrmTaskEntity[], IFindManyRequest>({
			providesTags: ['list'],
			query: (body) => ({ url: '/findMany', method: 'POST', body }),
		}),

		// Мои задачи
		getMyTasks: builder.query<ICrmTaskEntity[], void>({
			providesTags: ['my', 'list'],
			query: () => ({ url: '/my', method: 'GET' }),
		}),

		// Задачи по организации
		getByOrganizationId: builder.query<ICrmTaskEntity[], number | string>({
			providesTags: ['list'],
			query: (id) => ({ url: `/byOrganizationId/${id}`, method: 'GET' }),
		}),

		// Задачи по исполнителю
		getByAssigneeId: builder.query<ICrmTaskEntity[], number | string>({
			providesTags: ['list'],
			query: (id) => ({ url: `/byAssigneeId/${id}`, method: 'GET' }),
		}),

		// Получить по ID
		getById: builder.query<ICrmTaskEntity, number | string>({
			providesTags: ['current'],
			query: (id) => ({ url: `/byId/${id}`, method: 'GET' }),
		}),

		// Создать задачу
		create: builder.mutation<ICrmTaskEntity, ICrmTaskFormEntity>({
			invalidatesTags: ['list', 'my'],
			query: (body) => ({ url: '/', method: 'POST', body }),
		}),

		// Обновить задачу
		update: builder.mutation<ICrmTaskEntity, { id: number | string; data: Partial<ICrmTaskFormEntity> }>({
			invalidatesTags: ['list', 'current', 'my'],
			query: ({ id, data }) => ({ url: `/byId/${id}`, method: 'PATCH', body: data }),
		}),

		// Изменить статус
		updateStatus: builder.mutation<ICrmTaskEntity, { id: number | string; status: string }>({
			invalidatesTags: ['list', 'current', 'my'],
			query: ({ id, status }) => ({ url: `/byId/${id}/status`, method: 'PATCH', body: { status } }),
		}),

		// Удалить задачу
		delete: builder.mutation<ICrmTaskEntity, number | string>({
			invalidatesTags: ['list', 'my'],
			query: (id) => ({ url: `/byId/${id}`, method: 'DELETE' }),
		}),
	}),
});

export const CrmTaskService = {
	findMany: CrmTaskApi.useLazyFindManyQuery,
	getMyTasks: CrmTaskApi.useLazyGetMyTasksQuery,
	getByOrganizationId: CrmTaskApi.useLazyGetByOrganizationIdQuery,
	getByAssigneeId: CrmTaskApi.useLazyGetByAssigneeIdQuery,
	getById: CrmTaskApi.useLazyGetByIdQuery,
	create: CrmTaskApi.useCreateMutation,
	update: CrmTaskApi.useUpdateMutation,
	updateStatus: CrmTaskApi.useUpdateStatusMutation,
	delete: CrmTaskApi.useDeleteMutation,
};
