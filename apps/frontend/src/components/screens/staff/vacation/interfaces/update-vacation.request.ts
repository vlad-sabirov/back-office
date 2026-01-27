export interface UpdateVacationRequest {
	userId?: number;
	dateStart?: string;
	dateEnd?: string;
	comment?: string;
	isFake?: boolean;
}
