import { IFindRequest } from './request/find.request';
import { IFindResponse } from './response/find.response';
import { IApiConnectOrganizationDto, IApiFind } from './service.types';
import { ICrmContactApiAdd, ICrmContactApiEdit, ICrmContactApiList } from './service.types';
import { ICrmContactReducerFilterList, ICrmContactVoip } from './slice.types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Const } from '../config/const';
import { ICrmContactEntity } from '../entity';

export const CrmContactApi = createApi({
	reducerPath: `${Const.State.ReducerName}/api`,
	baseQuery: fetchBaseQuery({ baseUrl: '/api/crm/contact' }),
	tagTypes: ['current', 'list'],
	endpoints: (builder) => ({
		findMany: builder.query<IFindResponse, IFindRequest>({
			providesTags: ['list'],
			query: (body) => ({ url: '/findMany', method: 'POST', body }),
			transformResponse: (response: ICrmContactApiList) => {
				return {
					...response,
					data: response.data.map((contact) => ({
						...contact,
						userId: contact.userId || 0,
					})),
				};
			},
		}),
		fetchList: builder.query<ICrmContactApiList, ICrmContactReducerFilterList>({
			providesTags: ['list'],
			query: ({ limit, page, updatedAt, userIds, search }) => {
				const skip = (Number(page) - 1) * Number(limit);
				const userIdsResult =
					userIds && userIds.length ? (userIds[0] === 0 ? null : { in: userIds }) : undefined;
				const updatedAtResult = updatedAt ? { gte: updatedAt.start, lte: updatedAt.end } : undefined;

				return {
					url: '/findMany',
					method: 'POST',
					body: {
						where: {
							userId: userIdsResult,
							updatedAt: updatedAtResult,
						},
						include: { user: true, organizations: true, phones: true, emails: true },
						filter: { take: limit, skip, orderBy: { name: 'asc' } },
						search,
						power: {
							medium: Const.Settings.Power.Medium,
							low: Const.Settings.Power.Low,
							empty: Const.Settings.Power.Empty,
						},
					},
				};
			},
			transformResponse: (response: ICrmContactApiList) => {
				return {
					...response,
					data: response.data.map((contact) => ({
						...contact,
						userId: contact.userId || 0,
					})),
				};
			},
		}),
		search: builder.query<ICrmContactApiList, IApiFind>({
			query: ({ search, where, ignore, sort }) => {
				const userIdsResult =
					where?.userIds && where.userIds.length
						? where.userIds[0] === 0
							? null
							: { in: where.userIds }
						: undefined;
				const updatedAtResult = where?.updatedAt
					? { gte: where.updatedAt.start, lte: where.updatedAt.end }
					: undefined;
				const ignoreIdsResult =
					ignore?.ids && ignore.ids.length ? (ignore.ids[0] === 0 ? null : { in: ignore.ids }) : undefined;
				const ignoreUserIdsResult =
					ignore?.userIds && ignore.userIds.length
						? ignore.userIds[0] === 0
							? null
							: { in: ignore.userIds }
						: undefined;

				return {
					url: '/findMany',
					method: 'POST',
					body: {
						where: {
							userId: userIdsResult,
							updatedAt: updatedAtResult,
							isArchive: where?.isArchive ?? false,
							NOT:
								ignoreIdsResult || ignoreUserIdsResult
									? {
											id: ignoreIdsResult,
											userId: ignoreUserIdsResult,
									  }
									: undefined,
						},
						include: {
							user: true,
							organizations: true,
							phones: true,
							emails: true,
						},
						filter: {
							orderBy: { name: 'asc' },
							take: sort?.take,
							skip: sort?.skip,
						},
						search,
					},
				};
			},
			transformResponse: (response: ICrmContactApiList) => {
				return {
					...response,
					data: response.data.map((contact) => ({
						...contact,
						userId: contact.userId || 0,
					})),
				};
			},
		}),

		getVoip: builder.query<Record<string, ICrmContactVoip>, void>({
			query: () => ({ url: '/getVoip', method: 'GET' }),
		}),

		getCurrentById: builder.query<ICrmContactEntity | null, { id: number | string }>({
			providesTags: ['current'],
			query: ({ id }) => {
				return {
					url: '/findOnce',
					method: 'POST',
					body: {
						where: { id },
						include: {
							user: true,
							phones: true,
							emails: true,
							organizations: { include: { phones: true, emails: true, requisites: true } },
						},
					},
				};
			},
			transformResponse: (response: ICrmContactEntity) => {
				return {
					...response,
					userId: response.userId || 0,
				};
			},
		}),
		add: builder.mutation<ICrmContactEntity, ICrmContactApiAdd>({
			invalidatesTags: ['list'],
			query: (createDto) => ({ url: '/', method: 'POST', body: createDto }),
		}),
		edit: builder.mutation<ICrmContactEntity, ICrmContactApiEdit>({
			invalidatesTags: ['list', 'current'],
			query: ({ id, updateDto, phonesDto, emailsDto }) => ({
				url: `/byId/${id}`,
				method: 'PATCH',
				body: {
					updateDto: updateDto,
					phonesDto: phonesDto ?? undefined,
					emailsDto: emailsDto ?? undefined,
				},
			}),
		}),
		updateAt: builder.mutation<void, { id: number | string }>({
			invalidatesTags: ['current', 'list'],
			query: ({ id }) => ({ url: '/updateAt', method: 'PATCH', body: { id } }),
		}),
		connectOrganizations: builder.mutation<ICrmContactEntity, IApiConnectOrganizationDto>({
			invalidatesTags: ['current', 'list'],
			query: ({ contactId, organizationIds }) => ({
				url: '/connectOrganizations',
				method: 'PATCH',
				body: { contactId, organizationIds },
			}),
		}),
		searchIndexById: builder.mutation<void, { id: number | string }>({
			query: ({ id }) => ({ url: `/searchIndexById/${id}`, method: 'PATCH' }),
		}),
		delete: builder.mutation<ICrmContactEntity, { id: number | string }>({
			invalidatesTags: ['list'],
			query: ({ id }) => ({ url: '/byId/' + id, method: 'DELETE' }),
		}),
		deleteById: builder.mutation<ICrmContactEntity, number | string>({
			invalidatesTags: ['list'],
			query: (id) => ({ url: '/byId/' + id, method: 'DELETE' }),
		}),
	}),
});

export const CrmContactService = {
	add: CrmContactApi.useAddMutation,
	create: CrmContactApi.useAddMutation,
	edit: CrmContactApi.useEditMutation,
	findMany: CrmContactApi.useLazyFindManyQuery,
	fetchList: CrmContactApi.useLazyFetchListQuery,
	getVoip: CrmContactApi.useLazyGetVoipQuery,
	search: CrmContactApi.useLazySearchQuery,
	getCurrentById: CrmContactApi.useLazyGetCurrentByIdQuery,
	updateAt: CrmContactApi.useUpdateAtMutation,
	connectOrganizations: CrmContactApi.useConnectOrganizationsMutation,
	searchIndexById: CrmContactApi.useSearchIndexByIdMutation,
	delete: CrmContactApi.useDeleteMutation,
	deleteById: CrmContactApi.useDeleteByIdMutation,
};
