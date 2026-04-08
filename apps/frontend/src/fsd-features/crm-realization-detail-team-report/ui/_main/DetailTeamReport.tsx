import { FC, memo } from 'react';
import { IDetailTeamReportProps } from './detail-team-report.types';
import { ICrmRealizationMonthResEmployee } from '@fsd/entities/crm-realization';
import { StaffAvatar } from '@fsd/entities/staff';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { TextField } from '@fsd/shared/ui-kit';
import { NumberFormat } from '@helpers';
import css from './detail-team-report.module.scss';

export const DetailTeamReport: FC<IDetailTeamReportProps> = memo((props) => {
	const { data, title } = props;
	const employeeData: ICrmRealizationMonthResEmployee[] = data?.data.employees
		? JSON.parse(JSON.stringify(data?.data.employees))
		: [];
	employeeData.sort((a, b) => (b.realization ?? 0) - (a.realization ?? 0));

	const staffAll = useStateSelector((state) => state.staff.data.all);

	if (!employeeData || !employeeData.length) {
		return null;
	}
	return (
		<div>
			{title && (
				<TextField size={'small'} mode={'heading'} className={css.title}>
					{title}
				</TextField>
			)}

			<div className={css.wrapper}>
				{employeeData.map((employeeReport) => {
					const foundUser = staffAll.find((user) => user.id === employeeReport.userId);
					if (!foundUser) {
						return;
					}
					const childUsers = foundUser.child?.filter((c) => !c.isFired) || [];
					return (
						<div key={`employee_${employeeReport.userId}`} className={css.employee}>
							<StaffAvatar user={foundUser} size={'extraSmall'} />
							{childUsers.map((child) => (
								<StaffAvatar key={child.id} user={child} size={'extraSmall'} style={{ marginLeft: -6, opacity: 0.7 }} />
							))}
							<TextField size={'small'} className={css.employee__name}>
								{foundUser.lastName} {foundUser.firstName}
								{employeeReport.percent && <span>{employeeReport.percent}%</span>}
							</TextField>
							<div></div>
							<TextField size={'small'} className={css.employee__realization}>
								<span>{NumberFormat(employeeReport.realization, { round: true })}</span>
								{' / '}
								{NumberFormat(employeeReport.plan)}
							</TextField>
						</div>
					);
				})}
			</div>
		</div>
	);
});
DetailTeamReport.displayName = 'DetailTeamReport';
