import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Const } from '../config/const';
import { ICalendarEventEntity, ICalendarEventFormEntity, IRangeWithTasksResponse, ITodayPlanResponse } from '../entity';

interface IFindManyRequest {
	where?: {
		id?: number;
		type?: string | string[];
		title?: string;
		authorId?: number;
		assigneeId?: number;
		organizationId?: number;
		contactId?: number;
		taskId?: number;
		status?: string | string[];
		isAllDay?: boolean;
		participantUserId?: number;
	};
	filter?: {
		orderBy?: Record<string, 'asc' | 'desc'>;
		take?: number;
		skip?: number;
	};
}

interface IRangeRequest {
	from: string;
	to: string;
	userId?: number | string;
	includeAuthored?: boolean;
}

export const CalendarEventApi = createApi({
	reducerPath: `${Const.State.ReducerName}/api`,
	baseQuery: fetchBaseQuery({
		baseUrl: '/api/crm/calendar-event',
		prepareHeaders: (headers) => {
			const token = localStorage.getItem('accessToken');
			if (token) {
				headers.set('Authorization', `Bearer ${token}`);
			}
			return headers;
		},
	}),
	tagTypes: ['current', 'list', 'range', 'today'],
	endpoints: (builder) => ({
		// Найти много
		findMany: builder.query<ICalendarEventEntity[], IFindManyRequest>({
			providesTags: ['list'],
			query: (body) => ({ url: '/findMany', method: 'POST', body }),
		}),

		// События за период
		getByRange: builder.query<ICalendarEventEntity[], IRangeRequest>({
			providesTags: ['range'],
			query: ({ from, to, userId }) => {
				let url = `/range?from=${from}&to=${to}`;
				if (userId) url += `&userId=${userId}`;
				return { url, method: 'GET' };
			},
		}),

		// События + задачи за период (для страницы календаря)
		getRangeWithTasks: builder.query<IRangeWithTasksResponse, IRangeRequest>({
			providesTags: ['range'],
			query: ({ from, to, userId, includeAuthored }) => {
				let url = `/range-with-tasks?from=${from}&to=${to}`;
				if (userId) url += `&userId=${userId}`;
				if (includeAuthored) url += `&includeAuthored=true`;
				return { url, method: 'GET' };
			},
		}),

		// План на сегодня
		getTodayPlan: builder.query<ITodayPlanResponse, void>({
			providesTags: ['today'],
			query: () => ({ url: '/today-plan', method: 'GET' }),
		}),

		// По организации
		getByOrganizationId: builder.query<ICalendarEventEntity[], number | string>({
			providesTags: ['list'],
			query: (id) => ({ url: `/byOrganizationId/${id}`, method: 'GET' }),
		}),

		// По контакту
		getByContactId: builder.query<ICalendarEventEntity[], number | string>({
			providesTags: ['list'],
			query: (id) => ({ url: `/byContactId/${id}`, method: 'GET' }),
		}),

		// По задаче
		getByTaskId: builder.query<ICalendarEventEntity[], number | string>({
			providesTags: ['list'],
			query: (id) => ({ url: `/byTaskId/${id}`, method: 'GET' }),
		}),

		// Получить по ID
		getById: builder.query<ICalendarEventEntity, number | string>({
			providesTags: ['current'],
			query: (id) => ({ url: `/byId/${id}`, method: 'GET' }),
		}),

		// Создать событие
		create: builder.mutation<ICalendarEventEntity, ICalendarEventFormEntity>({
			invalidatesTags: ['list', 'range', 'today'],
			query: (body) => ({ url: '/', method: 'POST', body }),
		}),

		// Обновить событие
		update: builder.mutation<ICalendarEventEntity, { id: number | string; data: Partial<ICalendarEventFormEntity> }>({
			invalidatesTags: ['list', 'current', 'range', 'today'],
			query: ({ id, data }) => ({ url: `/byId/${id}`, method: 'PATCH', body: data }),
		}),

		// Обновить статус события (active / completed / cancelled)
		updateStatus: builder.mutation<ICalendarEventEntity, { id: number | string; status: string }>({
			invalidatesTags: ['list', 'current', 'range', 'today'],
			query: ({ id, status }) => ({ url: `/byId/${id}/status`, method: 'PATCH', body: { status } }),
		}),

		// Удалить событие
		delete: builder.mutation<ICalendarEventEntity, number | string>({
			invalidatesTags: ['list', 'range', 'today'],
			query: (id) => ({ url: `/byId/${id}`, method: 'DELETE' }),
		}),
	}),
});

export const CalendarEventService = {
	findMany: CalendarEventApi.useLazyFindManyQuery,
	getByRange: CalendarEventApi.useLazyGetByRangeQuery,
	getRangeWithTasks: CalendarEventApi.useLazyGetRangeWithTasksQuery,
	getTodayPlan: CalendarEventApi.useLazyGetTodayPlanQuery,
	getByOrganizationId: CalendarEventApi.useLazyGetByOrganizationIdQuery,
	getByContactId: CalendarEventApi.useLazyGetByContactIdQuery,
	getByTaskId: CalendarEventApi.useLazyGetByTaskIdQuery,
	getById: CalendarEventApi.useLazyGetByIdQuery,
	create: CalendarEventApi.useCreateMutation,
	update: CalendarEventApi.useUpdateMutation,
	updateStatus: CalendarEventApi.useUpdateStatusMutation,
	delete: CalendarEventApi.useDeleteMutation,
};

// ========== Participants API ==========

interface IAddParticipantsRequest {
	eventId: number;
	userIds: number[];
}

interface IRespondRequest {
	eventId: number;
	status: 'accepted' | 'declined';
}

interface IParticipantEntity {
	id: number;
	eventId: number;
	userId: number;
	status: string;
	user?: any;
	event?: any;
	createdAt: string;
}

export const CalendarParticipantApi = createApi({
	reducerPath: 'calendarParticipant/api',
	baseQuery: fetchBaseQuery({
		baseUrl: '/api/crm/calendar-participant',
		prepareHeaders: (headers) => {
			const token = localStorage.getItem('accessToken');
			if (token) {
				headers.set('Authorization', `Bearer ${token}`);
			}
			return headers;
		},
	}),
	tagTypes: ['participants', 'invitations'],
	endpoints: (builder) => ({
		// Добавить участников
		addParticipants: builder.mutation<{ added: number }, IAddParticipantsRequest>({
			invalidatesTags: ['participants'],
			query: (body) => ({ url: '/add', method: 'POST', body }),
		}),

		// Удалить участника
		removeParticipant: builder.mutation<void, { eventId: number; userId: number }>({
			invalidatesTags: ['participants'],
			query: ({ eventId, userId }) => ({ url: `/${eventId}/${userId}`, method: 'DELETE' }),
		}),

		// Ответить на приглашение
		respond: builder.mutation<{ status: string }, IRespondRequest>({
			invalidatesTags: ['invitations', 'participants'],
			query: (body) => ({ url: '/respond', method: 'POST', body }),
		}),

		// Получить участников события
		getByEventId: builder.query<IParticipantEntity[], number>({
			providesTags: ['participants'],
			query: (eventId) => ({ url: `/byEventId/${eventId}`, method: 'GET' }),
		}),

		// Получить все участия пользователя
		getByUserId: builder.query<IParticipantEntity[], number>({
			providesTags: ['participants'],
			query: (userId) => ({ url: `/byUserId/${userId}`, method: 'GET' }),
		}),

		// Мои приглашения
		getMyInvitations: builder.query<IParticipantEntity[], void>({
			providesTags: ['invitations'],
			query: () => ({ url: '/my-invitations', method: 'GET' }),
		}),
	}),
});

export const CalendarParticipantService = {
	addParticipants: CalendarParticipantApi.useAddParticipantsMutation,
	removeParticipant: CalendarParticipantApi.useRemoveParticipantMutation,
	respond: CalendarParticipantApi.useRespondMutation,
	getByEventId: CalendarParticipantApi.useLazyGetByEventIdQuery,
	getByUserId: CalendarParticipantApi.useLazyGetByUserIdQuery,
	getMyInvitations: CalendarParticipantApi.useGetMyInvitationsQuery,
};

// ========== Reminders API ==========

interface ICreateReminderRequest {
	eventId?: number;
	taskId?: number;
	remindAt: string;
}

interface IReminderEntity {
	id: number;
	eventId: number;
	userId: number;
	remindAt: string;
	isSent: boolean;
	event?: any;
	createdAt: string;
}

export const CalendarReminderApi = createApi({
	reducerPath: 'calendarReminder/api',
	baseQuery: fetchBaseQuery({
		baseUrl: '/api/crm/calendar-reminder',
		prepareHeaders: (headers) => {
			const token = localStorage.getItem('accessToken');
			if (token) {
				headers.set('Authorization', `Bearer ${token}`);
			}
			return headers;
		},
	}),
	tagTypes: ['reminders'],
	endpoints: (builder) => ({
		// Создать напоминание
		create: builder.mutation<IReminderEntity, ICreateReminderRequest>({
			invalidatesTags: ['reminders'],
			query: (body) => ({ url: '/', method: 'POST', body }),
		}),

		// Удалить напоминание
		delete: builder.mutation<void, number>({
			invalidatesTags: ['reminders'],
			query: (id) => ({ url: `/${id}`, method: 'DELETE' }),
		}),

		// Мои напоминания
		getMyReminders: builder.query<IReminderEntity[], void>({
			providesTags: ['reminders'],
			query: () => ({ url: '/my', method: 'GET' }),
		}),

		// Напоминание по событию
		getByEventId: builder.query<IReminderEntity | null, number>({
			providesTags: ['reminders'],
			query: (eventId) => ({ url: `/byEventId/${eventId}`, method: 'GET' }),
		}),
	}),
});

export const CalendarReminderService = {
	create: CalendarReminderApi.useCreateMutation,
	delete: CalendarReminderApi.useDeleteMutation,
	getMyReminders: CalendarReminderApi.useGetMyRemindersQuery,
	getByEventId: CalendarReminderApi.useLazyGetByEventIdQuery,
};
