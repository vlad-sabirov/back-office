import { IFindRequest } from './request/find.request';
import { IFindResponse } from './ressponse/find.response';
import { IApiFind, ICrmOrganizationApiList, IServiceConnectContacts } from './service.types';
import { IServiceConnectTags, IServiceCreate, IServiceUpdate } from './service.types';
import { ICrmOrganizationReducerFilterList, ICrmOrganizationVoip } from './slice.types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CrmOrganizationConst as Const } from '../config/const';
import { ICrmOrganizationEntity } from '../entity';

export const CrmOrganizationApi = createApi({
	reducerPath: `${Const.State.ReducerName}/api`,
	baseQuery: fetchBaseQuery({ baseUrl: '/api/crm/organization' }),
	tagTypes: ['current', 'list'],
	endpoints: (builder) => ({
		findMany: builder.query<IFindResponse, IFindRequest>({
			providesTags: ['list'],
			query: (body) => ({ url: '/findMany', method: 'POST', body }),
			transformResponse: (response: ICrmOrganizationApiList) => {
				return {
					...response,
					data: response.data.map((organization) => ({
						...organization,
						userId: organization.userId || 0,
					})),
				};
			},
		}),

		fetchList: builder.query<ICrmOrganizationApiList, ICrmOrganizationReducerFilterList>({
			providesTags: ['list'],
			query: ({
				limit,
				page,
				updatedAt,
				last1CUpdate,
				userIds,
				search,
				isVerified,
				isArchive,
				ignoreUserIds,
				createdAt,
				tags,
			}) => {
				const skip = (Number(page) - 1) * Number(limit);
				const userIdsResult =
					userIds && userIds.length ? (userIds[0] === 0 ? null : { in: userIds }) : undefined;
				const updatedAtResult = updatedAt ? { gt: updatedAt.start, lte: updatedAt.end } : undefined;
				const createdAtResult = createdAt ? { gt: createdAt.start, lte: createdAt.end } : undefined;
				const last1CUpdateResult = last1CUpdate ? { gt: last1CUpdate.start, lte: last1CUpdate.end } : undefined;

				return {
					url: '/findMany',
					method: 'POST',
					body: {
						where: {
							isVerified: isVerified ?? true,
							isArchive: isArchive ?? false,
							userId: userIdsResult,
							updatedAt: updatedAtResult,
							createdAt: createdAtResult,
							last1CUpdate: last1CUpdateResult,
							tags,
							NOT: ignoreUserIds ?? [{ userId: 0 }, { userId: 1 }],
						},
						include: {
							user: true,
							type: true,
							tags: true,
							requisites: true,
							contacts: true,
							phones: true,
							emails: true,
						},
						filter: { take: limit, skip, orderBy: { nameEn: 'asc' } },
						search,
						power: {
							medium: Const.Settings.Power.Medium,
							low: Const.Settings.Power.Low,
							empty: Const.Settings.Power.Empty,
						},
					},
				};
			},
			transformResponse: (response: ICrmOrganizationApiList) => {
				return {
					...response,
					data: response.data.map((organization) => ({
						...organization,
						userId: organization.userId || 0,
					})),
				};
			},
		}),
		search: builder.query<ICrmOrganizationApiList, IApiFind>({
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
							type: true,
							tags: true,
							contacts: true,
							phones: true,
							emails: true,
							requisites: true,
						},
						filter: {
							orderBy: { nameEn: 'asc' },
							take: sort?.take,
							skip: sort?.skip,
						},
						search,
					},
				};
			},
			transformResponse: (response: ICrmOrganizationApiList) => {
				return {
					...response,
					data: response.data.map((organization) => ({
						...organization,
						userId: organization.userId || 0,
					})),
				};
			},
		}),

		getVoip: builder.query<Record<string, ICrmOrganizationVoip>, void>({
			query: () => ({ url: '/getVoip', method: 'GET' }),
		}),

		getCurrentById: builder.query<ICrmOrganizationEntity, { id: number | string }>({
			providesTags: ['current'],
			query: ({ id }) => {
				return {
					url: '/findOnce',
					method: 'POST',
					body: {
						where: { id },
						include: {
							user: true,
							type: true,
							tags: true,
							requisites: true,
							phones: true,
							emails: true,
							contacts: { include: { phones: true, emails: true } },
						},
					},
				};
			},
			transformResponse: (response: ICrmOrganizationEntity) => ({
				...response,
				userId: response.userId || 0,
			}),
		}),
		create: builder.mutation<ICrmOrganizationEntity, IServiceCreate>({
			invalidatesTags: ['list'],
			query: (createDto) => ({ url: '/', method: 'POST', body: createDto }),
		}),
		updateById: builder.mutation<void, IServiceUpdate>({
			invalidatesTags: ['current', 'list'],
			query: ({ id, ...body }) => ({ url: `/byId/${id}`, method: 'PATCH', body }),
		}),
		updateAt: builder.mutation<void, { id: number | string }>({
			invalidatesTags: ['current', 'list'],
			query: ({ id }) => ({ url: '/updateAt', method: 'PATCH', body: { id } }),
		}),
		toArchiveById: builder.mutation<ICrmOrganizationEntity, { id: number | string }>({
			invalidatesTags: ['current', 'list'],
			query: ({ id }) => ({ url: `/toArchiveById/${id}`, method: 'PATCH' }),
		}),
		fromArchiveById: builder.mutation<ICrmOrganizationEntity, { id: number | string }>({
			invalidatesTags: ['current', 'list'],
			query: ({ id }) => ({ url: `/fromArchiveById/${id}`, method: 'PATCH' }),
		}),
		searchIndexById: builder.mutation<void, { id: number | string }>({
			query: ({ id }) => ({ url: `/searchIndexById/${id}`, method: 'PATCH' }),
		}),
		connectContacts: builder.mutation<ICrmOrganizationEntity, IServiceConnectContacts>({
			invalidatesTags: ['current', 'list'],
			query: ({ organizationId, contactIds }) => ({
				method: 'PATCH',
				url: `/connectContactsById/${organizationId}`,
				body: { contactIds },
			}),
		}),
		connectTags: builder.mutation<ICrmOrganizationEntity, IServiceConnectTags>({
			invalidatesTags: ['current', 'list'],
			query: ({ organizationId, tagIds }) => ({
				method: 'PATCH',
				url: `/connectTagsById/${organizationId}`,
				body: { tagIds },
			}),
		}),
		deleteById: builder.mutation<ICrmOrganizationEntity, number | string>({
			invalidatesTags: ['list'],
			query: (id) => ({ url: `/byId/${id}`, method: 'DELETE' }),
		}),
		getCountUnverified: builder.query<number, void>({
			query: () => ({ url: '/count/unverified', method: 'GET' }),
		}),
	}),
});

export const CrmOrganizationService = {
	create: CrmOrganizationApi.useCreateMutation,
	findMany: CrmOrganizationApi.useLazyFindManyQuery,
	fetchList: CrmOrganizationApi.useLazyFetchListQuery,
	getVoip: CrmOrganizationApi.useLazyGetVoipQuery,
	search: CrmOrganizationApi.useLazySearchQuery,
	getCurrentById: CrmOrganizationApi.useLazyGetCurrentByIdQuery,
	getCountUnverified: CrmOrganizationApi.useLazyGetCountUnverifiedQuery,
	updateById: CrmOrganizationApi.useUpdateByIdMutation,
	updateAt: CrmOrganizationApi.useUpdateAtMutation,
	toArchiveById: CrmOrganizationApi.useToArchiveByIdMutation,
	fromArchiveById: CrmOrganizationApi.useFromArchiveByIdMutation,
	searchIndexById: CrmOrganizationApi.useSearchIndexByIdMutation,
	connectContacts: CrmOrganizationApi.useConnectContactsMutation,
	connectTags: CrmOrganizationApi.useConnectTagsMutation,
	deleteById: CrmOrganizationApi.useDeleteByIdMutation,
};
