export interface IWorkingBaseUserRes {
	userId: number;
	total: number;
	active: number;
	medium: number;
	low: number;
	empty: number;
	createdAt?: string;
	updatedAt?: string;
}

export interface IWorkingBaseRes {
	year: number;
	month: number;
	total: number;
	active: number;
	medium: number;
	mediumDuration: number;
	low: number;
	lowDuration: number;
	empty: number;
	emptyDuration: number;
	users?: IWorkingBaseUserRes[];
	createdAt?: string;
	updatedAt?: string;
}
