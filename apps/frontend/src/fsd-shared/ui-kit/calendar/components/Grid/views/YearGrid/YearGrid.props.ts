import CalendarStore from '@fsd/shared/ui-kit/calendar/Calendar.store';
import { Context, DetailedHTMLProps, HTMLAttributes } from 'react';

export interface YearGridProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	ctx: Context<CalendarStore>;
}
