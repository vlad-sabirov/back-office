export interface ILogisticVedOrderUpdateDto {
	name?: string;
	isModification?: boolean;
	isDone?: boolean;
	isClose?: boolean;
	position?: number;
	isHide?: boolean;
	authorId?: number;
	performerId?: number;
	stageId?: number;
	fileOrder?: string;
	fileCalculate?: string;

	createdAt?: Date;
	updatedAt?: Date;
}
