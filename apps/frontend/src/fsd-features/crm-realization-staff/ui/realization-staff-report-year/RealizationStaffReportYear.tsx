import { FC, memo, useMemo } from 'react';
import { Team } from './parts/team/Team';
import { IRealizationStaffReportProps } from './realization-staff-report-year.types';
import classNames from 'classnames';
import { IStaffEntity } from '@fsd/entities/staff';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { TextField } from '@fsd/shared/ui-kit';
import css from './realization-staff-report-year.module.scss';

export const RealizationStaffReportYear: FC<IRealizationStaffReportProps> = memo((args) => {
	const { teams, diff, withDiff, isFullAccess } = args;
	const staffAll = useStateSelector((state) => state.staff.data.all);

	const staffHashMap = useMemo(() => {
		const hash: Map<number, IStaffEntity> = new Map();
		staffAll.forEach((user) => {
			hash.set(user.id, user);
		});
		return hash;
	}, [staffAll]);

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
			{teams.filter((teamReport) => {
				const user = staffHashMap.get(teamReport.userId);
				return !user?.isFired;
			}).map((teamReport) => (
				<Team
					key={`team_${teamReport.userId}`}
					teamReport={teamReport}
					diff={diff.find(({ userId }) => userId == teamReport.userId)}
					staffHashMap={staffHashMap}
					withDiff={withDiff}
					isFullAccess={isFullAccess}
				/>
			))}
		</div>
	);
});
RealizationStaffReportYear.displayName = 'RealizationStaffReportMonth';
