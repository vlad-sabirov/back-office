export class ProductionCalendarEntity {
	id: number;
	type: string;
	ctx?: string;
	name: string;
	description?: string;
	dateStart: Date;
	dateEnd: Date;
	isHide: boolean;
	createdAt: Date;
	updatedAt: Date;
}
