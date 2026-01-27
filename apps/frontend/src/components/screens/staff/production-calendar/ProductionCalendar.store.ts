import ProductionCalendarService from './ProductionCalendar.service';
import { makeAutoObservable } from 'mobx';
import { CalendarPropsEvent } from '@fsd/shared/ui-kit';

export default class ProductionCalendar {
	constructor() {
		makeAutoObservable(this);
	}

	modalEventEdit = false;
	setModalEventEdit(value: boolean): void {
		this.modalEventEdit = value;
	}

	events: CalendarPropsEvent[] = [];
	setEvents(value: CalendarPropsEvent[]): void {
		this.events = value;
	}

	targetEvent: (CalendarPropsEvent & { transfer?: CalendarPropsEvent[] }) | null = null;
	setTargetEvent(value: CalendarPropsEvent & { transfer?: CalendarPropsEvent[] }): void {
		this.targetEvent = value;
	}

	async getEvents(): Promise<void> {
		const [response] = await ProductionCalendarService.findMany({});
		const newEvents: CalendarPropsEvent[] = response
			? (response.map(({ id, name, type, ctx, description, dateStart, dateEnd }) => ({
					id,
					title: name,
					ctx,
					description,
					type,
					dateStart: new Date(dateStart),
					dateEnd: new Date(dateEnd),
				})) as CalendarPropsEvent[])
			: [];

		if (newEvents) this.setEvents(newEvents);
		return;
	}

	async getTargetEvent(ctx: number | string): Promise<void> {
		const [response] = await ProductionCalendarService.findMany({ ctx: String(ctx) });
		const holiday = response
			?.filter((event) => event.type !== 'transfer')
			.map(({ id, name, type, ctx, description, dateStart, dateEnd }) => ({
				id,
				title: name,
				ctx,
				description,
				type,
				dateStart: new Date(dateStart),
				dateEnd: new Date(dateEnd),
			}))[0] as CalendarPropsEvent;

		const transfer = response
			?.filter((event) => event.type === 'transfer')
			.map(({ id, name, type, ctx, description, dateStart, dateEnd }) => ({
				id,
				title: name,
				ctx,
				description,
				type,
				dateStart: new Date(dateStart),
				dateEnd: new Date(dateEnd),
			})) as CalendarPropsEvent[];

		if (holiday) this.setTargetEvent({ ...holiday, transfer });
	}
}
