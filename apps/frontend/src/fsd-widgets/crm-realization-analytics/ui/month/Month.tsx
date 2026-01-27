import { FC, useMemo } from 'react';
import { format, parse } from 'date-fns';
import { customLocaleRu } from '@config/date-fns.locale';
import { ICrmRealizationLinkedListAllValue, ICrmRealizationLinkedListTeamValue } from '@fsd/entities/crm-realization';
import { ICrmRealizationMonthResAll, useCrmRealizationGetDataMonthAll } from '@fsd/entities/crm-realization';
import { CrmRealizationDetailReportMonthFeature } from '@fsd/features/crm-realization-detail-report';
import { CrmRealizationHistoryChartFeature } from '@fsd/features/crm-realization-history-chart';
import { CrmRealizationStaffFeature } from '@fsd/features/crm-realization-staff';
import { useAccess, useStateSelector } from '@fsd/shared/lib/hooks';
import { ContentBlock } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { useElementSize } from '@mantine/hooks';
import { ACCESS } from '../../config/access';
import css from './month.module.scss';

export const Month: FC = () => {
	const reportAll = useCrmRealizationGetDataMonthAll();
	const year = useStateSelector((state) => state.crm_realization.currentYear);
	const month = useStateSelector((state) => state.crm_realization.currentMonth);
	const isFullAccess = useAccess({ access: ACCESS.FULL });
	const { userId, parent } = useUserDeprecated();
	const { ref: todayRef, height: todayHeight } = useElementSize();

	const reportHistory: ICrmRealizationMonthResAll[] = useMemo(() => {
		if (!userId) {
			return [];
		}
		if (isFullAccess) {
			const output = reportAll?.toArray({ reverse: true }) ?? [];
			output.pop();
			return output;
		} else {
			const output = reportAll?.getTeamByUserId(parent ?? userId) ?? [];
			output.pop();
			return output;
		}
	}, [isFullAccess, parent, reportAll, userId]);

	const reportToday: ICrmRealizationLinkedListAllValue | ICrmRealizationLinkedListTeamValue | null = useMemo(() => {
		if (!userId) {
			return null;
		}
		const dateToFind = `${year}-${month}`;
		if (isFullAccess) {
			return reportAll?.linkedList[dateToFind] ?? null;
		} else {
			return reportAll?.linkedList[dateToFind]?.downToTeams?.linkedList?.[parent ?? userId] ?? null;
		}
	}, [isFullAccess, month, parent, reportAll?.linkedList, userId, year]);

	const reportAllToday: ICrmRealizationLinkedListAllValue | null = useMemo(() => {
		if (!userId) {
			return null;
		}
		const dateToFind = `${year}-${month}`;
		return reportAll?.linkedList[dateToFind] ?? null;
	}, [month, reportAll?.linkedList, userId, year]);

	const formattedDate = useMemo(() => {
		return format(parse(`${year}-${month}`, 'yyyy-MM', new Date()), 'LLLL yyyy', { locale: customLocaleRu });
	}, [year, month]);

	return (
		<div className={css.root}>
			<ContentBlock className={css.history}>
				<CrmRealizationHistoryChartFeature data={reportHistory} height={todayHeight - 40} />
			</ContentBlock>

			<ContentBlock className={css.detail} ref={todayRef}>
				<CrmRealizationDetailReportMonthFeature
					title={`Реализация за ${formattedDate}`}
					data={reportToday}
					withDiff={true}
				/>
			</ContentBlock>

			<ContentBlock className={css.staff}>
				<CrmRealizationStaffFeature data={reportAllToday} isFullAccess={isFullAccess} withDiff />
			</ContentBlock>
		</div>
	);
};
