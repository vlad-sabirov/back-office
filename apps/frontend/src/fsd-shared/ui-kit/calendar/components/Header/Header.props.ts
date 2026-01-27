import { Context, DetailedHTMLProps, HTMLAttributes } from 'react';
import CalendarStore from '../../Calendar.store';

export interface HeaderProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	ctx: Context<CalendarStore>;
}
