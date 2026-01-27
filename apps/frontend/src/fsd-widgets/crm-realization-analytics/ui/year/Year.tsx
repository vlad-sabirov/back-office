import { FC, useMemo } from 'react';
import { format, parse } from 'date-fns';
import { ICrmRealizationMonthResAll, useCrmRealizationGetDataMonthAll } from '@fsd/entities/crm-realization';
import { CrmRealizationDetailReportYearFeature } from '@fsd/features/crm-realization-detail-report';
import { CrmRealizationHistoryChartFeature } from '@fsd/features/crm-realization-history-chart';
import { CrmRealizationStaffYearFeature } from '@fsd/features/crm-realization-staff';
import { useAccess, useStateSelector, useUser } from '@fsd/shared/lib/hooks';
import { ContentBlock } from '@fsd/shared/ui-kit';
import { useElementSize } from '@mantine/hooks';
import { ACCESS } from '../../config/access';
import { useGetDiff } from '../../lib/use-get-diff/use-get-diff';
import { useGetYear } from '../../lib/use-get-year/use-get-year';
import css from './year.module.scss';

export const Year: FC = () => {
	const reportAll = useCrmRealizationGetDataMonthAll();
	const year = useStateSelector((state) => state.crm_realization.currentYear);
	const month = useStateSelector((state) => state.crm_realization.currentMonth);
	const isFullAccess = useAccess({ access: ACCESS.FULL });
	const { userId } = useUser();
	const parent = useUser().getParent();
	const { ref: todayRef, height: todayHeight } = useElementSize();
	const currentYearData = useGetYear(year);
	const prevYearData = useGetYear(Number(year) - 1);
	const diff = useGetDiff(currentYearData, prevYearData);

	const reportHistory: ICrmRealizationMonthResAll[] = useMemo(() => {
		if (!userId) {
			return [];
		}
		if (isFullAccess) {
			return reportAll?.toArray({ reverse: true }) ?? [];
		} else {
			return reportAll?.getTeamByUserId(parent?.id ?? userId) ?? [];
		}
	}, [isFullAccess, parent, reportAll, userId]);

	const formattedDate = useMemo(() => {
		return format(parse(`${year}-${month}`, 'yyyy-MM', new Date()), 'yyyy');
	}, [year, month]);

	if (!currentYearData) return null;
	return (
		<div className={css.root}>
			<ContentBlock className={css.history}>
				<CrmRealizationHistoryChartFeature data={reportHistory} height={todayHeight - 40} type={'year'} />
			</ContentBlock>

			<ContentBlock className={css.detail} ref={todayRef}>
				<CrmRealizationDetailReportYearFeature
					title={`Реализация за ${formattedDate} год`}
					currentData={
						isFullAccess
							? currentYearData
							: currentYearData.teams.find((team) => (parent?.id ?? userId) == team.userId)
					}
					diffData={diff}
					withDiff={true}
					displayCustomerShipments={false}
				/>
			</ContentBlock>

			<ContentBlock className={css.staff}>
				<CrmRealizationStaffYearFeature
					teams={currentYearData.teams}
					diff={diff.teams}
					isFullAccess={isFullAccess}
					withDiff
				/>
			</ContentBlock>
		</div>
	);
};
