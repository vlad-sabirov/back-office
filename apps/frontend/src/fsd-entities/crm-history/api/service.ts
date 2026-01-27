import { ICreateDto } from './dto/create.dto';
import { IApiFeed } from '@fsd/entities/crm-history/api/service.types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Const } from '../config/const';
import { ICrmHistoryEntity } from '../entity';

export const Api = createApi({
	reducerPath: `${Const.State.ReducerName}/api`,
	baseQuery: fetchBaseQuery({ baseUrl: '/api/crm/history' }),
	tagTypes: ['list'],
	endpoints: (builder) => ({
		feed: builder.query<ICrmHistoryEntity[], IApiFeed>({
			query: (body) => ({ url: '/feed', body: { take: 10, ...body }, method: 'post' }),
			providesTags: ['list'],
		}),
		create: builder.mutation<ICrmHistoryEntity, ICreateDto>({
			query: (body) => {
				return { url: '/', method: 'POST', body };
			},
			invalidatesTags: ['list'],
		}),
	}),
});

export const Service = {
	feed: Api.useLazyFeedQuery,
	create: Api.useCreateMutation,
};
