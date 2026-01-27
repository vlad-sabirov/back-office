import $api from '@helpers/Api.http';
import { PrismaFilterRequest } from '@helpers/interfaces';

import {
	CrmOrganizationRequisiteResponse,
	MutationCrmOrganizationRequisiteRequest,
	QueryCrmOrganizationRequisiteRequest,
	ServiceResponse,
} from '@interfaces';

const PATH = '/crm/organization-requisite';

export class CrmOrganizationRequisiteService {
	static async create(
		{ createDto }: { createDto: MutationCrmOrganizationRequisiteRequest; }
	): Promise<ServiceResponse<CrmOrganizationRequisiteResponse>> {
		let response, error;
		await $api
			.post(PATH, createDto)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async findById(id: number): Promise<ServiceResponse<CrmOrganizationRequisiteResponse>> {
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
		where: QueryCrmOrganizationRequisiteRequest;
		filter?: PrismaFilterRequest<Omit<CrmOrganizationRequisiteResponse, 'user'>>;
		include?: Record<string, boolean>;
	}): Promise<ServiceResponse<CrmOrganizationRequisiteResponse>> {
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
		where: QueryCrmOrganizationRequisiteRequest;
		filter?: PrismaFilterRequest<Omit<CrmOrganizationRequisiteResponse, 'user'>>;
		include?: Record<string, boolean>;
	}): Promise<ServiceResponse<CrmOrganizationRequisiteResponse[]>> {
		let response, error;
		await $api
			.post(PATH + '/findMany', { where, filter, include })
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async updateById(
		{ id, updateDto }: { id: number; updateDto: Partial<MutationCrmOrganizationRequisiteRequest>; }
	): Promise<ServiceResponse<CrmOrganizationRequisiteResponse>> {
		let response, error;
		await $api
			.patch(PATH + '/byId/' + id, updateDto)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}

	static async deleteById(id: number): Promise<ServiceResponse<CrmOrganizationRequisiteResponse>> {
		let response, error;
		await $api
			.delete(PATH + '/byId/' + id)
			.then((res) => (response = res.data))
			.catch((err) => (error = err.response.data));
		return [response, error];
	}
}
