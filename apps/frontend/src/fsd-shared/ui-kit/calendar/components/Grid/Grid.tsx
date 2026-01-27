import { FC, useContext } from 'react';
import { MonthGrid, YearGrid } from './views';
import { observer } from 'mobx-react-lite';
import { GridProps } from '.';

export const Grid: FC<GridProps> = observer(({ ctx, ...props }) => {
	const CalendarStore = useContext(ctx);

	return (
		<div {...props}>
			{CalendarStore.view === 'month' && <MonthGrid ctx={ctx} />}
			{CalendarStore.view === 'year' && <YearGrid ctx={ctx} />}
		</div>
	);
});
