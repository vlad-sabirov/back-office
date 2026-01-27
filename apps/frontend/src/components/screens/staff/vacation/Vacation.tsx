import { FC, createContext, useContext, useEffect } from 'react';
import { LeftSection, RightSection, VacationList } from './components';
import VacationStore from './vacation.store';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { HeaderContent } from '@components/HeaderContent/HeaderContent';
import { VacationProps } from '.';
import css from './vacation.module.scss';

const vacationStore = new VacationStore();
export const VacationContext = createContext({ vacationStore });

export const Component: FC<VacationProps> = observer(({ ...props }) => {
	const { vacationStore } = useContext(VacationContext);

	useEffect(() => {
		vacationStore.getVacations();
	}, [
		vacationStore,
		vacationStore.date,
		vacationStore.filterUserId,
		vacationStore.filterDepartmentId,
		vacationStore.filterTerritoryId,
		vacationStore.filterIsFake,
	]);

	return (
		<>
			<Head>
				<title>Отпуска</title>
			</Head>

			<HeaderContent
				title={'Отпуска'}
				leftSection={<LeftSection isLoading={vacationStore.isLoading} />}
				rightSection={<RightSection />}
			/>

			<div className={css.root} {...props}>
				<VacationList data={vacationStore.vacation} />
			</div>
		</>
	);
});

const withHOC = <T extends Record<string, unknown>>(Component: FC<T>) => {
	return function withHOCComponent(props: T) {
		return (
			<VacationContext.Provider value={{ vacationStore }}>
				<Component {...props} />
			</VacationContext.Provider>
		);
	};
};

export const Vacation = withHOC(Component);
