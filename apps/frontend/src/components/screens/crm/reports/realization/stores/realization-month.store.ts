import { format } from 'date-fns';
import { makeAutoObservable } from 'mobx';
import { ReportRealizationResponse } from '@interfaces';
import { getRealizationListData } from '@screens/crm/reports/realization/data';

export class RealizationMonthStore {
	constructor() {
		makeAutoObservable(this);
	}

	isInit = false;
	setInit = (value: typeof this.isInit): void => {
		this.isInit = value;
	};

	date: Date = new Date();
	setDate = (value: typeof this.date): void => {
		this.date = value;
		this.isInit = true;
	};

	realizationList: ReportRealizationResponse[] | [] = [];
	setRealizationList = (value: typeof this.realizationList): void => {
		this.realizationList = value;
	};
	getRealizationList = async (): Promise<void> => {
		const year = format(this.date, 'yyyy');
		const month = format(this.date, 'MM');
		if (year && month) this.setRealizationList(await getRealizationListData({ date: { year, month } }));
	};

	realizationListAll: ReportRealizationResponse[] | [] = [];
	setRealizationListAll = (value: typeof this.realizationListAll): void => {
		this.realizationListAll = value;
	};
	getRealizationListAll = async (): Promise<void> => {
		this.setRealizationListAll(await getRealizationListData({}));
	};
}
