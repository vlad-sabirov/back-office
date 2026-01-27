import { IStaffDepartmentAddRequest, IStaffDepartmentEditRequest } from './interfaces';
import { IStaffDepartmentResortRequest, IStaffDepartmentResponse } from './interfaces';
import { AxiosResponse } from 'axios';
import $api from '@helpers/Api.http';

export class UserDepartmentService {
	static async create(dto: IStaffDepartmentAddRequest): Promise<AxiosResponse<IStaffDepartmentResponse>> {
		return $api.post('/user-department', { departmentDto: dto });
	}

	static async findAll(): Promise<AxiosResponse<IStaffDepartmentResponse[]>> {
		return $api.get('/user-department');
	}

	static async findById(id: number): Promise<AxiosResponse<IStaffDepartmentResponse>> {
		return $api.get('/user-department/byId/' + id);
	}

	static async findByName(name: string): Promise<AxiosResponse<IStaffDepartmentResponse>> {
		return $api.get('/user-department/byName/' + name);
	}

	static async findDepartmentParentByChildId(id: number): Promise<AxiosResponse<IStaffDepartmentResponse[]>> {
		return $api.get('/user-department/byChildId/' + id);
	}

	static async updateById(
		id: number,
		dto: IStaffDepartmentEditRequest
	): Promise<AxiosResponse<IStaffDepartmentResponse>> {
		return $api.patch('/user-department/byId/' + id, { departmentDto: dto });
	}

	static async resortDepartment(dto: IStaffDepartmentResortRequest[]): Promise<AxiosResponse<void>> {
		return $api.patch('/user-department/resort', dto);
	}

	static async deleteById(id: number): Promise<AxiosResponse<IStaffDepartmentResponse>> {
		return $api.delete('/user-department/byId/' + id);
	}
}
