/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IPerformanceContainer {
	logger: IPerformanceLogger;
	name: string;
	message?: string;
}

export interface IPerformanceMark {
	name: string;
	message?: string;
}

export interface IPerformanceShow {
	name: string;
	message: string;
	prev?: string;
}

export type IPerformanceLogger = (...args: any) => any;
