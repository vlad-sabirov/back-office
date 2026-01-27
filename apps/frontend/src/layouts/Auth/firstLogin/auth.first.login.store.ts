import { makeAutoObservable } from 'mobx';
import { IUserResponse } from '@interfaces/user/UserList.response';

export class Store {
	step = 1;
	user: IUserResponse = {} as IUserResponse;

	constructor() {
		makeAutoObservable(this);
	}

	setStep(value: number): void {
		this.step = value;
	}

	setUser(value: IUserResponse): void {
		this.user = value;
	}
}

export default Store;
