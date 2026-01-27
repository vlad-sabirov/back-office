import { makeAutoObservable } from 'mobx';
import { LatenessDataResponse } from '@interfaces';

export default class LatenessPerRangeStore {
	constructor() {
		makeAutoObservable(this);
	}

	date: Date = new Date();
	setDate = (value: typeof this.date) => {
		this.date = value;
	};

	data: LatenessDataResponse[] = [];
	setData = (value: typeof this.data) => {
		this.data = value;
	};

	current: LatenessDataResponse | null = null;
	setCurrent = (value: LatenessDataResponse | null) => {
		this.current = value;
	};

	refreshStamp = 0;
	setRefreshStamp = (value: typeof this.refreshStamp) => {
		this.refreshStamp = value;
	};
	getRefreshStamp = () => {
		this.setRefreshStamp(new Date().getTime());
	};
}
