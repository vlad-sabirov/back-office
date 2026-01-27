import { VacationResponse } from './interfaces';
import { getData } from './utils/get-data';
import { endOfYear, format, startOfYear } from 'date-fns';
import { makeAutoObservable } from 'mobx';

export type VacationStoreDate = { dateStart: string; dateEnd: string };

export default class VacationStore {
	constructor() {
		makeAutoObservable(this);
	}

	isLoading = false;
	setIsLoading = (value: boolean) => {
		this.isLoading = value;
	};

	date: VacationStoreDate = {
		dateStart: format(startOfYear(new Date()), 'yyyy-MM-dd'),
		dateEnd: format(endOfYear(new Date()), 'yyyy-MM-dd'),
	};
	setDate = (value: VacationStoreDate) => {
		this.date = value;
	};

	filterUserId: number | string | undefined = undefined;
	setFilterUserId = (value: number | string | undefined) => {
		this.filterUserId = value;
	};

	filterDepartmentId: string | null = null;
	setFilterDepartmentId = (value: string | null) => {
		this.filterDepartmentId = value;
	};

	filterTerritoryId: string | null = null;
	setFilterTerritoryId = (value: string | null) => {
		this.filterTerritoryId = value;
	};

	filterIsFake = true;
	setFilterIsFake = (value: boolean) => {
		this.filterIsFake = value;
	};

	vacation: VacationResponse[] = [];
	setVacations(value: VacationResponse[]): void {
		this.vacation = value;
	}

	async getVacations() {
		this.setIsLoading(true);
		const response = await getData({
			date: {
				dateStart: this.date.dateStart,
				dateEnd: this.date.dateEnd,
			},
			userId: this.filterUserId,
			filterDepartmentId: this.filterDepartmentId ?? undefined,
			filterTerritoryId: this.filterTerritoryId ?? undefined,
			filterIsFake: this.filterIsFake,
		});
		this.setVacations(response);
		this.setIsLoading(false);
	}
}
