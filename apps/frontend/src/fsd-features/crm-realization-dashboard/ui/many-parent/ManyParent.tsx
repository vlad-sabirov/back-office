import { FC, useMemo } from 'react';
import { format, parse } from 'date-fns';
import { CrmRealizationHistoryChartFeature } from 'fsd-features/crm-realization-history-chart';
import { customLocaleRu } from '@config/date-fns.locale';
import {
	ICrmRealizationLinkedListEmployeeValue,
	ICrmRealizationLinkedListTeamValue,
	ICrmRealizationMonthResTeam,
} from '@fsd/entities/crm-realization';
import { useCrmRealizationGetDataMonthAll } from '@fsd/entities/crm-realization';
import { ContentBlock } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { useElementSize } from '@mantine/hooks';
import { CrmRealizationDetailReportMonthFeature } from '../../../crm-realization-detail-report';
import { CrmRealizationDetailTeamReportFeature } from '../../../crm-realization-detail-team-report';
import css from './many-parent.module.scss';

const DATE_TODAY = format(new Date(), 'yyyy-MM');

export const ManyParent: FC = () => {
	const { ref: refTeam, height: teamHeight } = useElementSize();
	const { ref: refEmployee, height: employeeHeight } = useElementSize();
	const reportAll = useCrmRealizationGetDataMonthAll();
	const { userId } = useUserDeprecated();

	const teamReportAll: ICrmRealizationMonthResTeam[] = useMemo(() => {
		if (!reportAll) {
			return [];
		}
		const output = reportAll
			.getTeamByUserId(userId ?? 0, { reverse: false })
			.filter((report) => report.realization);
		output.pop();
		return output;
	}, [reportAll, userId]);

	const employeeReportAll: ICrmRealizationMonthResTeam[] = useMemo(() => {
		if (!reportAll) {
			return [];
		}
		const output = reportAll
			.getEmployeeByUserId(userId ?? 0, { reverse: false })
			.filter((report) => report.realization);
		output.pop();
		return output;
	}, [reportAll, userId]);

	const teamReportToday: ICrmRealizationLinkedListTeamValue | null = useMemo(() => {
		if (!reportAll) {
			return null;
		}
		return reportAll.linkedList?.[DATE_TODAY]?.downToTeams?.linkedList[userId ?? 0] ?? null;
	}, [reportAll, userId]);

	const employeeReportToday: ICrmRealizationLinkedListEmployeeValue | null = useMemo(() => {
		if (!reportAll) {
			return null;
		}
		return reportAll.linkedList?.[DATE_TODAY]?.downToEmployees?.linkedList?.[userId ?? 0] ?? null;
	}, [reportAll, userId]);

	const date = useMemo(
		() =>
			format(
				parse(
					`${reportAll?.last?.data?.year ?? 1990}-${reportAll?.last?.data?.month ?? 8}`,
					'yyyy-MM',
					new Date()
				),
				'LLLL',
				{ locale: customLocaleRu }
			),
		[reportAll]
	);

	return (
		<div className={css.root}>
			<div className={css.leftSection}>
				<ContentBlock className={css.history}>
					<CrmRealizationHistoryChartFeature data={employeeReportAll} height={teamHeight - 40} />
				</ContentBlock>

				<ContentBlock className={css.history}>
					<CrmRealizationHistoryChartFeature data={teamReportAll} height={employeeHeight - 40} />
				</ContentBlock>
			</div>

			<div className={css.rightSection}>
				<ContentBlock className={css.todayTeam} ref={refTeam}>
					<CrmRealizationDetailReportMonthFeature
						title={`Моя реализация за ${date}`}
						data={employeeReportToday}
						withDiff={true}
					/>
				</ContentBlock>

				<ContentBlock className={css.todayMy} ref={refEmployee}>
					<CrmRealizationDetailTeamReportFeature data={teamReportToday} title={`Реализация по сотрудникам`} />
				</ContentBlock>
			</div>
		</div>
	);
};
