import UserRoleService from './user-role.service';
import { makeAutoObservable } from 'mobx';
import { IUserRoleResponse } from '@interfaces/user/UserRole.response';

export default class UserRoleStore {
	roleCurrent: IUserRoleResponse | undefined;
	roleList: IUserRoleResponse[] = [];

	constructor() {
		makeAutoObservable(this);
	}

	setRoleCurrent(value: IUserRoleResponse): void {
		this.roleCurrent = value;
	}

	setRoleList(value: IUserRoleResponse[]): void {
		this.roleList = value;
	}

	async getRoleList(): Promise<void> {
		const [response] = await UserRoleService.findAllRoles();
		if (response) this.setRoleList(response);
	}
}
