import $api from '@helpers/Api.http';
import { PrismaFilterRequest } from '@helpers/interfaces';

import {
	CrmOrganizationTypeResponse,
	MutationCrmOrganizationTypeRequest,
	QueryCrmOrganizationTypeRequest,
	ServiceResponse,
} from '@interfaces';

const PATH = '/crm/organization-type';

export class CrmOrganizationTypeService {
	static async create(
		{ createDto }: { createDto: MutationCrmOrganizationTypeRequest; }
	): Promise<ServiceResponse<CrmOrganizationTypeResponse>> {
		let response, error;
		await $api
			.post(PATH, createDto)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async findById(id: number): Promise<ServiceResponse<CrmOrganizationTypeResponse>> {
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
		where: QueryCrmOrganizationTypeRequest;
		filter?: PrismaFilterRequest<Omit<CrmOrganizationTypeResponse, 'user'>>;
		include?: Record<string, boolean>;
	}): Promise<ServiceResponse<CrmOrganizationTypeResponse>> {
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
		where: QueryCrmOrganizationTypeRequest;
		filter?: PrismaFilterRequest<Omit<CrmOrganizationTypeResponse, 'user'>>;
		include?: Record<string, boolean>;
	}): Promise<ServiceResponse<CrmOrganizationTypeResponse[]>> {
		let response, error;
		await $api
			.post(PATH + '/findMany', { where, filter, include })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async updateById(
		{ id, updateDto }: { id: number; updateDto: Partial<MutationCrmOrganizationTypeRequest>; }
	): Promise<ServiceResponse<CrmOrganizationTypeResponse>> {
		let response, error;
		await $api
			.patch(PATH + '/byId/' + id, updateDto)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async deleteById(id: number): Promise<ServiceResponse<CrmOrganizationTypeResponse>> {
		let response, error;
		await $api
			.delete(PATH + '/byId/' + id)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}
}
