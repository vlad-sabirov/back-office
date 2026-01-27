import { IStaffTerritoryAddRequest, IStaffTerritoryEditRequest } from './interfaces';
import { IStaffTerritoryResortRequest, IStaffTerritoryResponse } from './interfaces';
import { AxiosResponse } from 'axios';
import $api from '@helpers/Api.http';

export class UserTerritoryService {
	static async create(dto: IStaffTerritoryAddRequest): Promise<AxiosResponse<IStaffTerritoryResponse>> {
		return $api.post('/user-territory', { territoryDto: dto });
	}

	static async findAll(): Promise<AxiosResponse<IStaffTerritoryResponse[]>> {
		return $api.get('/user-territory');
	}

	static async findById(id: number): Promise<AxiosResponse<IStaffTerritoryResponse>> {
		return $api.get('/user-territory/byId/' + id);
	}

	static async updateById(
		id: number,
		dto: IStaffTerritoryEditRequest
	): Promise<AxiosResponse<IStaffTerritoryResponse>> {
		return $api.patch('/user-territory/byId/' + id, { territoryDto: dto });
	}

	static async resortTerritory(dto: IStaffTerritoryResortRequest[]): Promise<AxiosResponse<void>> {
		return $api.patch('/user-territory/resort', dto);
	}

	static async deleteById(id: number): Promise<AxiosResponse<IStaffTerritoryResponse>> {
		return $api.delete('/user-territory/byId/' + id);
	}
}
