export interface IFindDuplicate {
	userId: number | string;
	dateArray: Date[];
	error?: {
		status: boolean;
		ignoreId?: number[] | number;
	};
}
