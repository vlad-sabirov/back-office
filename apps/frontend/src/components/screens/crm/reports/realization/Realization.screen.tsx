import { FC, createContext, useContext, useEffect, useState } from 'react';
import { FilterPeriodType } from './cfg';
import { GaugeChart, LineChart } from './charts';
import { LeftSection, List, RightSection } from './components';
import { RealizationAdd } from './modals';
import { RealizationMonthStore, RealizationQuarterStore, RealizationStore, RealizationYearStore } from './stores';
import { endOfQuarter, format, subMonths } from 'date-fns';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { ContentBlock } from '@fsd/shared/ui-kit';
import { HeaderContent } from '@components/HeaderContent/HeaderContent';
import { customLocaleRu } from '@config/date-fns.locale';
import { ReportRealizationResponse } from '@interfaces';
import { getRealizationListData } from '@screens/crm/reports/realization/data';
import { RealizationPlanList } from '@screens/crm/reports/realization/modals';
import css from './styles.module.scss';

const realizationStore = new RealizationStore();
const realizationMonthStore = new RealizationMonthStore();
const realizationQuarterStore = new RealizationQuarterStore();
const realizationYearStore = new RealizationYearStore();
export const ReportRealizationContext = createContext({
	realizationStore,
	realizationMonthStore,
	realizationQuarterStore,
	realizationYearStore,
});

const Component: FC = observer(() => {
	const [oldData, setOldData] = useState<ReportRealizationResponse[]>([]);
	const { realizationStore, realizationMonthStore, realizationQuarterStore, realizationYearStore } =
		useContext(ReportRealizationContext);
	const [realizationAll, setRealizationAll] = useState<ReportRealizationResponse[]>([]);
	const [realizationShow, setRealizationShow] = useState<ReportRealizationResponse[]>([]);
	const title =
		realizationStore.sortType == FilterPeriodType.Month
			? format(realizationMonthStore.date, 'LLLL yyyy', { locale: customLocaleRu })
			: realizationStore.sortType == FilterPeriodType.Quarter
			? `${format(realizationQuarterStore.date, 'LLLL', { locale: customLocaleRu })}-${format(
					endOfQuarter(realizationQuarterStore.date),
					'LLLL',
					{ locale: customLocaleRu }
				)} ${format(realizationQuarterStore.date, 'yyyy', { locale: customLocaleRu })}`
			: format(realizationYearStore.date, 'yyyy', { locale: customLocaleRu });

	useEffect(() => {
		if (realizationStore.sortType === FilterPeriodType.Month) {
			setRealizationAll(realizationMonthStore.realizationListAll);
			setRealizationShow(realizationMonthStore.realizationList);
		}

		if (realizationStore.sortType === FilterPeriodType.Quarter) {
			setRealizationAll(realizationQuarterStore.realizationListAll);
			setRealizationShow(realizationQuarterStore.realizationList);
		}

		if (realizationStore.sortType === FilterPeriodType.Year) {
			setRealizationAll(realizationYearStore.realizationListAll);
			setRealizationShow(realizationYearStore.realizationList);
		}
	}, [
		realizationStore.sortType,
		realizationMonthStore.realizationList,
		realizationMonthStore.realizationListAll,
		realizationQuarterStore.realizationList,
		realizationQuarterStore.realizationListAll,
		realizationYearStore.realizationList,
		realizationYearStore.realizationListAll,
	]);

	useEffect(() => {
		realizationStore.getMinRealizationDate();
		realizationStore.getMinPlanDate();
		realizationStore.getMaxRealizationDate();
		realizationStore.getMaxPlanDate();
		realizationStore.getRealizationList();
		realizationStore.getPlanList();
	}, [realizationStore]);

	useEffect(() => {
		if (realizationStore.sortType === FilterPeriodType.Month) {
			realizationMonthStore.getRealizationList();
			realizationMonthStore.getRealizationListAll();
		}
	}, [realizationStore.sortType, realizationMonthStore.date, realizationMonthStore]);

	useEffect(() => {
		if (realizationMonthStore && realizationStore.maxRealizationDate && !realizationMonthStore.isInit) {
			realizationMonthStore.setDate(realizationStore.maxRealizationDate);
		}
	}, [realizationMonthStore, realizationStore.maxRealizationDate, realizationMonthStore.isInit]);

	useEffect(() => {
		let isMounted = true;
		realizationMonthStore.getRealizationList();
		(async () => {
			const year = format(subMonths(realizationMonthStore.date, 1), 'yyyy');
			const month = format(subMonths(realizationMonthStore.date, 1), 'MM');
			const oldRealization = await getRealizationListData({ date: { year, month } });
			if (isMounted) setOldData(oldRealization);
		})();
		return () => {
			isMounted = false;
		};
	}, [realizationMonthStore, realizationMonthStore.date]);

	useEffect(() => {
		if (
			realizationStore.sortType === FilterPeriodType.Quarter &&
			realizationQuarterStore &&
			realizationQuarterStore.date
		) {
			realizationQuarterStore.getRealizationList();
			realizationQuarterStore.getRealizationListAll();
		}
	}, [realizationStore.sortType, realizationQuarterStore, realizationQuarterStore.date]);

	useEffect(() => {
		if (realizationQuarterStore && realizationStore.maxRealizationDate && !realizationQuarterStore.isInit) {
			realizationQuarterStore.setDate(realizationStore.maxRealizationDate);
			realizationQuarterStore.setInit(true);
		}
	}, [realizationQuarterStore, realizationStore.maxRealizationDate]);

	useEffect(() => {
		if (realizationStore.sortType === FilterPeriodType.Year && realizationYearStore && realizationYearStore.date) {
			realizationYearStore.getRealizationList();
			realizationYearStore.getRealizationListAll();
		}
	}, [realizationStore.sortType, realizationYearStore, realizationYearStore.date]);

	useEffect(() => {
		if (realizationYearStore && realizationStore.maxRealizationDate && !realizationYearStore.isInit) {
			realizationYearStore.setDate(realizationStore.maxRealizationDate);
			realizationYearStore.setInit(true);
		}
	}, [realizationYearStore, realizationStore.maxRealizationDate]);

	return (
		<>
			<Head>
				<title>Отчет о реализации компании. Back Office</title>
			</Head>

			<HeaderContent title="Отчет о реализации" leftSection={<LeftSection />} rightSection={<RightSection />} />

			<div className={css.wrapper}>
				<ContentBlock className={css.chartLine}>
					<LineChart data={realizationAll} displayType={realizationStore.sortType} />
				</ContentBlock>

				<ContentBlock className={css.chartGauge}>
					<GaugeChart data={realizationShow} />
				</ContentBlock>

				<ContentBlock title={`Отчет за ${title}`} withoutPaddingX className={css.staff}>
					<List data={realizationShow} oldData={oldData} displayType={realizationStore.sortType} />
				</ContentBlock>
			</div>

			<RealizationAdd />
			<RealizationPlanList data={realizationStore.planList} />
		</>
	);
});

const withHOC = <T extends Record<string, unknown>>(Component: FC<T>) => {
	return function withHOCComponent(props: T) {
		return (
			<ReportRealizationContext.Provider
				value={{ realizationStore, realizationMonthStore, realizationQuarterStore, realizationYearStore }}
			>
				<Component {...props} />
			</ReportRealizationContext.Provider>
		);
	};
};

const CrmReportRealization = withHOC(Component);
export default CrmReportRealization;
