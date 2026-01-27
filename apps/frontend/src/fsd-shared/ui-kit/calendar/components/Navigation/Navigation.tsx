import { FC, useContext } from 'react';
import cn from 'classnames';
import { observer } from 'mobx-react-lite';
import { CalendarPropsView, TextField } from '@fsd/shared/ui-kit';
import { NavigationProps } from '.';
import css from './Navigation.module.scss';

type IView = typeof CalendarPropsView[number];

export const Navigation: FC<NavigationProps> = observer(({ ctx, className, ...props }) => {
	const CalendarStore = useContext(ctx);

	const handleSetView = (newView: IView) => {
		if (CalendarStore.view === newView) return;
		CalendarStore.setView(newView);
	};

	if (CalendarStore.views && CalendarStore.views.length <= 1)
		return <div {...props} className={cn(css.root, className)}></div>;

	return (
		<div {...props} className={cn(css.root, className)}>
			{(!CalendarStore.views || CalendarStore.views?.includes('day')) && (
				<TextField
					className={cn(css.item, { [css.active]: CalendarStore.view === 'day' })}
					onClick={() => handleSetView('day')}
					disabled={CalendarStore.loading}
				>
					День
				</TextField>
			)}

			{(!CalendarStore.views || CalendarStore.views?.includes('week')) && (
				<TextField
					className={cn(css.item, { [css.active]: CalendarStore.view === 'week' })}
					onClick={() => handleSetView('week')}
					disabled={CalendarStore.loading}
				>
					Неделя
				</TextField>
			)}

			{(!CalendarStore.views || CalendarStore.views?.includes('month')) && (
				<TextField
					className={cn(css.item, { [css.active]: CalendarStore.view === 'month' })}
					onClick={() => handleSetView('month')}
					disabled={CalendarStore.loading}
				>
					Месяц
				</TextField>
			)}

			{(!CalendarStore.views || CalendarStore.views?.includes('month')) && (
				<TextField
					className={cn(css.item, { [css.active]: CalendarStore.view === 'year' })}
					onClick={() => handleSetView('year')}
					disabled={CalendarStore.loading}
				>
					Год
				</TextField>
			)}
		</div>
	);
});
