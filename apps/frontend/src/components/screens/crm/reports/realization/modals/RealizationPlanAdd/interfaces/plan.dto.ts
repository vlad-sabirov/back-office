interface Data {
	userId: number;
	plan: number;
}

interface Date {
	year: number;
	month: number;
}

export interface IRealizationPlanEditDto {
	data: Data[];
	date: Date;
}
