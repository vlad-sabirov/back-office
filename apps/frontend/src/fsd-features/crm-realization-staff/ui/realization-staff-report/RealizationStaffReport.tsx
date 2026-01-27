import { FC, memo, useMemo, useState } from 'react';
import { Team } from './parts/team/Team';
import { IRealizationStaffReportProps } from './realization-staff-report.types';
import classNames from 'classnames';
import { ICrmRealizationMonthResEmployee, ICrmRealizationMonthResTeam } from '@fsd/entities/crm-realization';
import { IStaffEntity } from '@fsd/entities/staff';
import { CrmRealizationWhatIfFeature } from '@fsd/features/crm-realization-what-if';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { TextField } from '@fsd/shared/ui-kit';
import css from './realization-staff-report.module.scss';

export const RealizationStaffReport: FC<IRealizationStaffReportProps> = memo((args) => {
	const { data, withDiff, isFullAccess } = args;
	const staffAll = useStateSelector((state) => state.staff.data.all);
	const currentData = data?.downToTeams?.toArray().sort((a, b) => (b.realization ?? 0) - (a.realization ?? 0)) ?? [];
	const staffHashMap = useMemo(() => {
		const hash: Map<number, IStaffEntity> = new Map();
		staffAll.forEach((user) => {
			hash.set(user.id, user);
		});
		return hash;
	}, [staffAll]);

	const [currentReport, setCurrentReport] = useState<
		ICrmRealizationMonthResTeam | ICrmRealizationMonthResEmployee | null
	>(null);
	const [isShowWhatIf, setIsShowWhatIf] = useState<boolean>(false);

	if (!data) {
		return null;
	}
	return (
		<div className={css.root}>
			<div className={css.heading}>
				<TextField className={css.item}>Сотрудник</TextField>
				<TextField className={css.item}>Реализация</TextField>
				<TextField className={css.item}>План</TextField>
				<TextField className={css.item}>Средний чек</TextField>
				<TextField className={classNames(css.item, css.center)}>Глубина</TextField>
				<TextField className={classNames(css.item, css.center)}>% отгрузок</TextField>
				<TextField className={css.item}>Выполнение плана</TextField>
			</div>
			{currentData.map((teamReport) => (
				<Team
					key={`team_${teamReport.userId}`}
					teamReport={teamReport}
					dataReport={data}
					staffHashMap={staffHashMap}
					withDiff={withDiff}
					isFullAccess={isFullAccess}
					setCurrentReport={setCurrentReport}
					setIsShowWhatIf={setIsShowWhatIf}
				/>
			))}

			<CrmRealizationWhatIfFeature report={currentReport} isOpen={isShowWhatIf} setIsOpen={setIsShowWhatIf} />
		</div>
	);
});
RealizationStaffReport.displayName = 'RealizationStaffReport';
