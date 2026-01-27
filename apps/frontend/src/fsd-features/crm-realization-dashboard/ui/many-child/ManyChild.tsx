import { FC, useMemo } from 'react';
import { format, parse } from 'date-fns';
import { customLocaleRu } from '@config/date-fns.locale';
import {
	ICrmRealizationLinkedListEmployeeValue,
	ICrmRealizationLinkedListTeamValue,
	ICrmRealizationMonthResTeam,
} from '@fsd/entities/crm-realization';
import { useCrmRealizationGetDataMonthAll } from '@fsd/entities/crm-realization';
import { CrmRealizationDetailReportMonthFeature } from '@fsd/features/crm-realization-detail-report';
import { CrmRealizationHistoryChartFeature } from '@fsd/features/crm-realization-history-chart';
import { ContentBlock } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { useElementSize } from '@mantine/hooks';
import css from './many-child.module.scss';

const DATE_TODAY = format(new Date(), 'yyyy-MM');

export const ManyChild: FC = () => {
	const { ref: refTeam, height: teamHeight } = useElementSize();
	const { ref: refEmployee, height: employeeHeight } = useElementSize();
	const reportAll = useCrmRealizationGetDataMonthAll();
	const { userId, parent } = useUserDeprecated();

	const teamReportAll: ICrmRealizationMonthResTeam[] = useMemo(() => {
		if (!reportAll) {
			return [];
		}
		const output = reportAll
			.getTeamByUserId(parent ?? userId ?? 0, { reverse: false })
			.filter((report) => report.realization);
		output.pop();
		return output;
	}, [parent, reportAll, userId]);

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
		return reportAll.linkedList?.[DATE_TODAY]?.downToTeams?.linkedList[parent ?? userId ?? 0] ?? null;
	}, [parent, reportAll, userId]);

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
					<CrmRealizationHistoryChartFeature data={teamReportAll} height={teamHeight - 40} />
				</ContentBlock>

				<ContentBlock className={css.history}>
					<CrmRealizationHistoryChartFeature data={employeeReportAll} height={employeeHeight - 40} />
				</ContentBlock>
			</div>

			<div className={css.rightSection}>
				<ContentBlock className={css.todayTeam} ref={refTeam}>
					<CrmRealizationDetailReportMonthFeature
						title={`Реализация команды за ${date}`}
						data={teamReportToday}
						withDiff={true}
					/>
				</ContentBlock>

				<ContentBlock className={css.todayMy} ref={refEmployee}>
					<CrmRealizationDetailReportMonthFeature
						title={`Моя реализация за ${date}`}
						data={employeeReportToday}
						withDiff={true}
					/>
				</ContentBlock>
			</div>
		</div>
	);
};
