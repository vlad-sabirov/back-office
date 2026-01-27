import { makeAutoObservable } from 'mobx';

export default class ContactStore {
	constructor() {
		makeAutoObservable(this);
	}
}
