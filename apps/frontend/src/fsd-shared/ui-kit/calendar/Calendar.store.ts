import { makeAutoObservable } from 'mobx';
import { CalendarPropsEvent, CalendarPropsStartDay, CalendarPropsView } from '@fsd/shared/ui-kit';

export default class CalendarStore {
	constructor() {
		makeAutoObservable(this);
	}

	events: CalendarPropsEvent[] = [];
	setEvents(value: CalendarPropsEvent[]): void {
		this.events = value;
	}

	date: Date = new Date();
	setDate(value: Date): void {
		this.date = value;
	}

	min: Date | undefined = undefined;
	setMin(value: Date): void {
		this.min = value;
	}

	max: Date | undefined = undefined;
	setMax(value: Date): void {
		this.max = value;
	}

	startDay: typeof CalendarPropsStartDay[number] = 'monday';
	setStartDay(value: typeof CalendarPropsStartDay[number]): void {
		this.startDay = value;
	}

	view: typeof CalendarPropsView[number] = 'month';
	setView(value: typeof CalendarPropsView[number]): void {
		this.view = value;
	}

	views: typeof CalendarPropsView[number][] | undefined = undefined;
	setViews(value: typeof CalendarPropsView[number][]): void {
		this.views = value;
	}

	loading = false;
	setLoading(value: boolean) {
		this.loading = value;
	}
}
