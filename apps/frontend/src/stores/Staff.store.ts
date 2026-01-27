import { makeAutoObservable } from 'mobx';
import { IUserResponse } from '@interfaces/user/UserList.response';
import { IUserRoleResponse } from '@interfaces/user/UserRole.response';
import { IStaffDepartmentResponse, UserDepartmentService } from '@screens/staff';
import { IStaffTerritoryResponse, UserTerritoryService } from '@screens/staff';
import UserService from '@services/User.service';

export default class StaffStore {
	constructor() {
		makeAutoObservable(this);
	}

	hasGetData = false;
	setHasGetData(value: boolean) {
		this.hasGetData = value;
	}

	userCurrent: IUserResponse = {} as IUserResponse;
	setUserCurrent(value: IUserResponse): void {
		this.userCurrent = value;
	}

	userList: IUserResponse[] = [] as IUserResponse[];
	setUserList(value: IUserResponse[]): void {
		this.userList = value;
	}

	userRoleList: IUserRoleResponse[] = [] as IUserRoleResponse[];
	setUserRoleList(value: IUserRoleResponse[]): void {
		this.userRoleList = value;
	}

	departmentCurrent: IStaffDepartmentResponse = {} as IStaffDepartmentResponse;
	setDepartmentCurrent(value: IStaffDepartmentResponse): void {
		this.departmentCurrent = value;
	}

	departmentParent: IStaffDepartmentResponse = {} as IStaffDepartmentResponse;
	setDepartmentParent(value: IStaffDepartmentResponse): void {
		this.departmentParent = value;
	}

	departmentChildList: IStaffDepartmentResponse[] = [] as IStaffDepartmentResponse[];
	setDepartmentChildList(value: IStaffDepartmentResponse[]): void {
		this.departmentChildList = value;
	}

	territoryCurrent: IStaffTerritoryResponse = {} as IStaffTerritoryResponse;
	setTerritoryCurrent(value: IStaffTerritoryResponse) {
		this.territoryCurrent = value;
	}

	territoryList: IStaffTerritoryResponse[] = [] as IStaffTerritoryResponse[];
	setTerritoryList(value: IStaffTerritoryResponse[]) {
		this.territoryList = value;
	}
	async setCurrentUserById(id: string) {
		const [user] = await UserService.findById(Number(id));
		if (user) this.setUserCurrent(user);
	}

	async getUserList() {
		const [data] = await UserService.findAll();
		if (data) this.setUserList(data);
	}

	findUserByVoip(voip: string): IUserResponse {
		return this.userList.filter((user) => user.phoneVoip === voip)[0];
	}

	async getUserRoleList() {
		const [data] = await UserService.findAllRoles();
		if (data) this.setUserRoleList(data);
	}

	async getDepartmentList() {
		const { data } = await UserDepartmentService.findByName('Руководство');
		const { child, ...parent } = data;
		this.setDepartmentParent(parent);
		this.setDepartmentChildList(child as IStaffDepartmentResponse[]);
	}

	async getTerritoryList() {
		const { data } = await UserTerritoryService.findAll();
		this.setTerritoryList(data);
	}
}
