import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';

export const CalendarPropsStartDay = ['monday', 'sunday'] as const;
export const CalendarPropsView = ['day', 'week', 'month', 'year'] as const;
export const CalendarPropsEventType = ['default', 'holiday', 'transfer', 'birthday', 'vacation'] as const;

interface CalendarPropsSlot {
	position: number;
	display: boolean;
}

export interface CalendarPropsEvent {
	id?: string | number;
	type?: typeof CalendarPropsEventType[number];
	title: string;
	description?: string;
	dateStart: Date;
	dateEnd: Date;
	isAllDay?: boolean;
	isManyDays?: boolean;
	priority?: number;
	ctx?: string;
	color?: string;
	icon?: ReactNode;
	slot?: CalendarPropsSlot;
	onClick?: () => void;
}

export interface CalendarProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	date?: Date;
	min?: Date;
	max?: Date;
	startDay?: typeof CalendarPropsStartDay[number];
	view?: typeof CalendarPropsView[number];
	views?: typeof CalendarPropsView[number][];
	events?: CalendarPropsEvent[];
	loading?: boolean;
	onDayOverflowClick?: (date: Date, events: CalendarPropsEvent[]) => void;
}
