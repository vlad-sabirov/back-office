import $api from '@helpers/Api.http';
import { PrismaFilterRequest } from '@helpers/interfaces';

import {
	CrmOrganizationTagResponse,
	MutationCrmOrganizationTagRequest,
	QueryCrmOrganizationTagRequest,
	ServiceResponse,
} from '@interfaces';

const PATH = '/crm/organization-tag';

export class CrmOrganizationTagService {
	static async create(
		{ createDto }: { createDto: MutationCrmOrganizationTagRequest; }
	): Promise<ServiceResponse<CrmOrganizationTagResponse>> {
		let response, error;
		await $api
			.post(PATH, createDto)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async findById(id: number): Promise<ServiceResponse<CrmOrganizationTagResponse>> {
		let response, error;
		await $api
			.get(PATH + '/byId/' + id)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async findOnce({
		where, filter, include
	}: {
		where: QueryCrmOrganizationTagRequest;
		filter?: PrismaFilterRequest<Omit<CrmOrganizationTagResponse, 'user'>>;
		include?: Record<string, boolean>;
	}): Promise<ServiceResponse<CrmOrganizationTagResponse>> {
		let response, error;
		await $api
			.post(PATH + '/findOnce', { where, filter, include })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async findMany({
		where, filter, include
	}: {
		where: QueryCrmOrganizationTagRequest;
		filter?: PrismaFilterRequest<Omit<CrmOrganizationTagResponse, 'user'>>;
		include?: Record<string, boolean>;
	}): Promise<ServiceResponse<CrmOrganizationTagResponse[]>> {
		let response, error;
		await $api
			.post(PATH + '/findMany', { where, filter, include })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async updateById(
		{ id, updateDto }: { id: number; updateDto: Partial<MutationCrmOrganizationTagRequest>; }
	): Promise<ServiceResponse<CrmOrganizationTagResponse>> {
		let response, error;
		await $api
			.patch(PATH + '/byId/' + id, updateDto)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async deleteById(id: number): Promise<ServiceResponse<CrmOrganizationTagResponse>> {
		let response, error;
		await $api
			.delete(PATH + '/byId/' + id)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}
}
