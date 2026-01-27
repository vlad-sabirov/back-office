export interface CreateVacationRequest {
	userId: number | string;
	dateStart: string;
	dateEnd: string;
	comment?: string;
	isFake: boolean;
}
