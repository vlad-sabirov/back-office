import { FC, createContext, useContext, useEffect, useState } from 'react';
import ProductionCalendarStore from './ProductionCalendar.store';
import { RightSection } from './components';
import { EditEventModal } from './modals';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { Calendar, CalendarPropsEvent, ContentBlock } from '@fsd/shared/ui-kit';
import { HeaderContent } from '@components/HeaderContent/HeaderContent';
import { useAccess } from '@hooks';
import { ProductionCalendarProps } from '.';

const productionCalendarStore = new ProductionCalendarStore();
export const ProductionCalendarContext = createContext(productionCalendarStore);

const Component: FC<ProductionCalendarProps> = observer((props) => {
	const Store = useContext(ProductionCalendarContext);
	const CheckAccess = useAccess();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [events, setEvents] = useState<CalendarPropsEvent[]>();

	useEffect(() => {
		setIsLoading(true);
		(async () => {
			await Store.getEvents();
		})();
	}, [Store]);

	useEffect(() => {
		const newEvents = Store.events.map((event) => ({
			...event,
			onClick: CheckAccess(['developer', 'boss', 'vacation'])
				? () => {
						// eslint-disable-next-line @typescript-eslint/no-empty-function
						if (event.ctx) Store.getTargetEvent(event.ctx).then(() => {});
						Store.setModalEventEdit(true);
					}
				: undefined,
		}));
		setEvents(newEvents);
		setIsLoading(false);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [Store.events]);

	// noinspection RequiredAttributes
	return (
		<div {...props}>
			<Head>
				<title>Список сотрудников. Back Office</title>
			</Head>
			<HeaderContent title="Праздники" rightSection={<RightSection />} />

			<ContentBlock>
				<Calendar views={['year']} view="year" loading={isLoading} events={events} />
			</ContentBlock>

			<EditEventModal />
		</div>
	);
});

const withHOC = <T extends ProductionCalendarProps>(Component: FC<T>) => {
	return function withHOCComponent(props: T) {
		return (
			<ProductionCalendarContext.Provider value={productionCalendarStore}>
				<Component {...props} />
			</ProductionCalendarContext.Provider>
		);
	};
};

export const ProductionCalendar = withHOC(Component);
