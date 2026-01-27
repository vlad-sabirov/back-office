import $api from '@helpers/Api.http';
import { PrismaFilterRequest } from '@helpers/interfaces';

import {
	CrmOrganizationResponse,
	MutationCrmOrganizationRequest,
	QueryCrmOrganizationRequest,
	ServiceResponse,
} from '@interfaces';

const PATH = '/crm/organization';

export class CrmOrganizationService {
	static async create(
		{ createDto }: { createDto: MutationCrmOrganizationRequest; }
	): Promise<ServiceResponse<CrmOrganizationResponse>> {
		let response, error;
		await $api
			.post(PATH, createDto)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async findById(id: number): Promise<ServiceResponse<CrmOrganizationResponse>> {
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
		where: QueryCrmOrganizationRequest;
		filter?: PrismaFilterRequest<Omit<CrmOrganizationResponse, 'user'>>;
		include?: Record<string, boolean>;
	}): Promise<ServiceResponse<CrmOrganizationResponse>> {
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
		where: QueryCrmOrganizationRequest;
		filter?: PrismaFilterRequest<Omit<CrmOrganizationResponse, 'user'>>;
		include?: Record<string, boolean>;
	}): Promise<ServiceResponse<CrmOrganizationResponse[]>> {
		let response, error;
		await $api
			.post(PATH + '/findMany', { where, filter, include })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async findManyWithCount({
		where, filter, include
	}: {
		where: QueryCrmOrganizationRequest;
		filter?: PrismaFilterRequest<Omit<CrmOrganizationResponse, 'user'>>;
		include?: Record<string, boolean>;
	}): Promise<ServiceResponse<{ data: CrmOrganizationResponse[], count: number }>> {
		let response, error;
		await $api
			.post(PATH + '/findManyWithCount', { where, filter, include })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async updateById(
		{ id, updateDto }: { id: number; updateDto: Partial<MutationCrmOrganizationRequest>; }
	): Promise<ServiceResponse<CrmOrganizationResponse>> {
		let response, error;
		await $api
			.patch(PATH + '/byId/' + id, updateDto)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async connectContactsById(
		{ organizationId, contactIds }: { organizationId: number | string; contactIds: number[] | string[]; }
	): Promise<ServiceResponse<CrmOrganizationResponse>> {
		let response, error;
		await $api
			.patch(PATH + '/connectContactsById/' + organizationId, { contactIds })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async connectTagsById(
		{ organizationId, tagIds }: { organizationId: number | string; tagIds: number[] | string[]; }
	): Promise<ServiceResponse<CrmOrganizationResponse>> {
		let response, error;
		await $api
			.patch(PATH + '/connectTagsById/' + organizationId, { tagIds })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async deleteById(id: number): Promise<ServiceResponse<CrmOrganizationResponse>> {
		let response, error;
		await $api
			.delete(PATH + '/byId/' + id)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}
}
