import { makeAutoObservable } from 'mobx';
import { ReportRealizationResponse } from '@interfaces';
import { FilterPeriodType } from '../';
import { getMaxPlanDateData, getMaxRealizationDateData, getMinPlanDateData, getMinRealizationDateData } from '../data';
import { getPlanListData, getRealizationListData } from '../data';

export class RealizationStore {
	constructor() {
		makeAutoObservable(this);
	}

	sortType: FilterPeriodType = 'month' as FilterPeriodType.Month;
	setSortType = (value: typeof this.sortType): void => {
		this.sortType = value;
	};

	minRealizationDate: Date | null = null;
	setMinRealizationDate = (value: typeof this.minRealizationDate): void => {
		this.minRealizationDate = value;
	};
	getMinRealizationDate = async () => {
		this.setMinRealizationDate(await getMinRealizationDateData({}));
	};

	maxRealizationDate: Date | null = null;
	setMaxRealizationDate = (value: typeof this.maxRealizationDate): void => {
		this.maxRealizationDate = value;
	};
	getMaxRealizationDate = async () => {
		this.setMaxRealizationDate(await getMaxRealizationDateData({}));
	};

	minPlanDate: Date | null = null;
	setMinPlanDate = (value: typeof this.minPlanDate): void => {
		this.minPlanDate = value;
	};
	getMinPlanDate = async () => {
		this.setMinPlanDate(await getMinPlanDateData({}));
	};

	maxPlanDate: Date | null = null;
	setMaxPlanDate = (value: typeof this.maxPlanDate): void => {
		this.maxPlanDate = value;
	};
	getMaxPlanDate = async () => {
		this.setMaxPlanDate(await getMaxPlanDateData({}));
	};

	realizationList: ReportRealizationResponse[] | [] = [];
	setRealizationList = (value: typeof this.realizationList): void => {
		this.realizationList = value;
	};
	getRealizationList = async (): Promise<void> => {
		this.setRealizationList(await getRealizationListData({}));
	};

	planList: ReportRealizationResponse[] | [] = [];
	setPlanList = (value: typeof this.planList): void => {
		this.planList = value;
	};
	getPlanList = async (): Promise<void> => {
		this.setPlanList(await getPlanListData({ order: 'desc' }));
	};
}
