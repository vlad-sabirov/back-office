import { makeAutoObservable } from 'mobx';

export default class LatenessStore {
	constructor() {
		makeAutoObservable(this);
	}

	dateSingle: Date = new Date();
	setDateSingle = (value: typeof this.dateSingle): void => {
		this.dateSingle = value;
	};

	dateSingleRefreshStamp = 0;
	setDateSingleRefreshStamp = (value: typeof this.dateSingleRefreshStamp): void => {
		this.dateSingleRefreshStamp = value;
	};
}
