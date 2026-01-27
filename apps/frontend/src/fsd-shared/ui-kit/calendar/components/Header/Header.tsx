import { FC, useContext } from 'react';
import { MonthHeader, YearHeader } from './views';
import { observer } from 'mobx-react-lite';
import { HeaderProps } from '.';

export const Header: FC<HeaderProps> = observer(({ ctx, ...props }) => {
	const CalendarStore = useContext(ctx);

	return (
		<div {...props}>
			{CalendarStore.view === 'month' && <MonthHeader ctx={ctx} />}
			{CalendarStore.view === 'year' && <YearHeader ctx={ctx} />}
		</div>
	);
});
