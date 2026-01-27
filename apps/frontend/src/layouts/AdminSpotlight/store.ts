import { makeAutoObservable } from 'mobx';

interface IModals {
	authAdmin: boolean;
	authUsers: boolean;
}

export default class AdminStore {
	isAuth = false;
	openedModalAfterAuth: string | null = null;
	modals: IModals = {
		authAdmin: false,
		authUsers: false,
	};

	constructor() {
		makeAutoObservable(this);
	}

	setAuth(value: boolean) {
		this.isAuth = value;
	}

	setOpenedModalAfterAuth(value: string) {
		this.openedModalAfterAuth = value;
	}

	async modalOpen(modalState: keyof IModals, value?: boolean): Promise<void> {
		this.modals[modalState] = typeof value !== 'undefined' ? value : !this.modals[modalState];
	}
}
