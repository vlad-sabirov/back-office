import { ReactNode } from 'react';
import { makeAutoObservable } from 'mobx';

export default class AdminStore {
	activeBuilder: ReactNode = undefined;
	activeBuilderName = '';

	constructor() {
		makeAutoObservable(this);
	}

	setActiveBuilder(value: ReactNode): void {
		this.activeBuilder = value;
	}

	setActiveBuilderName(value: string): void {
		this.activeBuilderName = value;
	}
}
