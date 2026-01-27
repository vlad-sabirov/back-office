import { IFindTaskRequestV1, IFindTasksRequestV1, IGetTasksByUserIdRequestV1 } from './req';
import { ICheckTaskRequestV1, ICreateTaskRequestV1 } from './req';
import { IFindTaskResponseV1, IFindTasksResponseV1, IGetTasksResponseV1 } from './res';
import { ICheckTaskResponseV1, ICreateTaskResponseV1 } from './res';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const TodoApi = createApi({
	reducerPath: `todo/api`,
	baseQuery: fetchBaseQuery({ baseUrl: '/api/todo' }),
	tagTypes: ['current', 'my'],
	endpoints: (builder) => ({
		checkTaskByID: builder.mutation<ICheckTaskResponseV1, ICheckTaskRequestV1>({
			query: (body) => ({
				url: `/task/${body.task_id}/check`,
				method: 'PATCH',
				body: { is_checked: body.is_checked },
			}),
		}),
		createTask: builder.query<ICreateTaskResponseV1, ICreateTaskRequestV1>({
			query: (body) => ({ url: '/task', method: 'POST', body }),
		}),
		getTasksByUserID: builder.query<IGetTasksResponseV1, IGetTasksByUserIdRequestV1>({
			query: (body) => ({ url: '/task/get-tasks-by-user-id', method: 'POST', body }),
		}),
		findTask: builder.query<IFindTaskResponseV1, IFindTaskRequestV1>({
			query: (body) => ({ url: '/task/find-task', method: 'POST', body }),
		}),
		findTasks: builder.query<IFindTasksResponseV1, IFindTasksRequestV1>({
			query: (body) => ({ url: '/task/find-tasks', method: 'POST', body }),
		}),
	}),
});

export const TodoService = {
	createTask: TodoApi.useLazyCreateTaskQuery,
	getTasksByUserID: TodoApi.useLazyGetTasksByUserIDQuery,
	findTask: TodoApi.useLazyFindTaskQuery,
	findTasks: TodoApi.useLazyFindTasksQuery,
	checkTaskByID: TodoApi.useCheckTaskByIDMutation,
};
