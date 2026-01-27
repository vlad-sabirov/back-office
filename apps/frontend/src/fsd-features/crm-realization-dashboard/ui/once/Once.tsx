import { FC, useMemo } from 'react';
import { format } from 'date-fns';
import { ICrmRealizationLinkedListTeamValue, ICrmRealizationMonthResTeam } from '@fsd/entities/crm-realization';
import { useCrmRealizationGetDataMonthAll } from '@fsd/entities/crm-realization';
import { CrmRealizationDetailReportMonthFeature } from '@fsd/features/crm-realization-detail-report';
import { CrmRealizationHistoryChartFeature } from '@fsd/features/crm-realization-history-chart';
import { ContentBlock } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { useElementSize } from '@mantine/hooks';
import css from './once.module.scss';

const DATE_TODAY = format(new Date(), 'yyyy-MM');

export const Once: FC = () => {
	const { ref, height: blockHeight } = useElementSize();
	const reportAll = useCrmRealizationGetDataMonthAll();
	const { userId, parent } = useUserDeprecated();

	const myReportToday: ICrmRealizationLinkedListTeamValue | null = useMemo(() => {
		if (!reportAll) {
			return null;
		}
		return reportAll.linkedList?.[DATE_TODAY]?.downToTeams?.linkedList[parent ?? userId ?? 0] ?? null;
	}, [parent, reportAll, userId]);

	const myReportAll: ICrmRealizationMonthResTeam[] = useMemo(() => {
		if (!reportAll) {
			return [];
		}
		const output = reportAll
			.getTeamByUserId(parent ?? userId ?? 0, { reverse: false })
			.filter((report) => report.realization);
		output.pop();
		return output;
	}, [parent, reportAll, userId]);

	return (
		<div className={css.root}>
			<ContentBlock className={css.history}>
				<CrmRealizationHistoryChartFeature data={myReportAll} height={blockHeight - 40} />
			</ContentBlock>

			<ContentBlock className={css.today} ref={ref}>
				<CrmRealizationDetailReportMonthFeature data={myReportToday} withDiff={true} />
			</ContentBlock>
		</div>
	);
};
