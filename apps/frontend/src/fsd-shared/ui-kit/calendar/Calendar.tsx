import { Context, FC, createContext, useContext, useEffect, useMemo, useState } from 'react';
import CalendarStore from './Calendar.store';
import { Grid, Header, Navigation } from './components';
import cn from 'classnames';
import { observer } from 'mobx-react-lite';
import { CalendarProps } from '.';
import css from './Calendar.module.scss';

const CalendarContext = createContext(new CalendarStore());

const Component: FC<CalendarProps & { ctx: Context<CalendarStore> }> = observer(
	({ date, events, min, max, startDay, view, views, ctx, loading, onDayOverflowClick, className, ...props }) => {
		const [isLoaded, setIsLoaded] = useState<boolean>(false);
		const CalendarStore = useContext(ctx);

		useEffect(() => {
			CalendarStore.setEvents(events || []);
			if (!date)
				CalendarStore.setDate(min && new Date() < min ? min : max && new Date() > max ? max : new Date());
			if (date) CalendarStore.setDate(min && date < min ? min : max && date > max ? max : date);
			if (min) CalendarStore.setMin(min);
			if (max) CalendarStore.setMax(max);
			if (startDay) CalendarStore.setStartDay(startDay);
			if (view) CalendarStore.setView(view);
			if (!view && views) CalendarStore.setView(views[0]);
			if (views) CalendarStore.setViews(views);
			CalendarStore.setLoading(!!loading);
			CalendarStore.setOnDayOverflowClick(onDayOverflowClick || null);
			setIsLoaded(true);
		}, [CalendarStore, events, date, max, min, startDay, view, views, loading, onDayOverflowClick]);

		if (!isLoaded) return <div></div>;

		return (
			<div className={cn(css.root, className)} {...props}>
				<Header className={css.header} ctx={ctx} />
				<Navigation className={css.navigation} ctx={ctx} />
				<Grid className={css.grid} ctx={ctx} />
			</div>
		);
	}
);

const withHOC = <T extends CalendarProps>(Component: FC<T & { ctx: Context<CalendarStore> }>) => {
	return function WithHOCComponent(props: T) {
		const store = useMemo(() => new CalendarStore(), []);
		const newProps: T & { ctx: Context<CalendarStore> } = { ...props, ctx: CalendarContext };

		return (
			<CalendarContext.Provider value={store}>
				<Component {...newProps} />
			</CalendarContext.Provider>
		);
	};
};

export const Calendar = withHOC(Component);
