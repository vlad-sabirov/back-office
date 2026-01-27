import { FC, useMemo } from 'react';
import { TodayChartEmpty } from './parts/TodayChartEmpty';
import { format } from 'date-fns';
import { useCrmRealizationGetDataMonthAll } from '@fsd/entities/crm-realization';
import { CrmRealizationDetailAllReportFeature } from '@fsd/features/crm-realization-detail-all-report';
import { CrmRealizationDetailReportMonthFeature } from '@fsd/features/crm-realization-detail-report';
import { CrmRealizationHistoryChartFeature } from '@fsd/features/crm-realization-history-chart';
import { ContentBlock } from '@fsd/shared/ui-kit';
import { useElementSize } from '@mantine/hooks';
import css from './boss.module.scss';

const DATE_TODAY = format(new Date(), 'yyyy-MM');

export const Boss: FC = () => {
	const reportAll = useCrmRealizationGetDataMonthAll();

	const reportAllData = useMemo(() => {
		const data = reportAll?.toArray({ reverse: true }).filter((report) => report.realization) ?? [];
		data.pop();
		return data;
	}, [reportAll]);

	const reportToday = useMemo(() => {
		return reportAll?.linkedList?.[DATE_TODAY] ?? null;
	}, [reportAll?.linkedList]);

	const { ref: refLeft } = useElementSize();
	const { ref: refDetail } = useElementSize();

	return (
		<div className={css.root}>
			<div className={css.leftSection} ref={refLeft}>
				<ContentBlock className={css.history}>
					{/* eslint-disable-next-line react/jsx-no-undef */}
					<CrmRealizationHistoryChartFeature height={280} data={reportAllData} />
				</ContentBlock>

				<ContentBlock className={css.todayTotal} height={240} ref={refDetail}>
					<CrmRealizationDetailReportMonthFeature data={reportToday} withDiff={true} />
				</ContentBlock>

				<ContentBlock className={css.todayChart} height={240}>
					<TodayChartEmpty />
				</ContentBlock>
			</div>

			<ContentBlock className={css.todayDetail} height={580}>
				<CrmRealizationDetailAllReportFeature data={reportToday} height={500} />
			</ContentBlock>
		</div>
	);
};
