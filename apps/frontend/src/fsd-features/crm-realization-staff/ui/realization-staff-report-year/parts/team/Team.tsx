import { FC } from 'react';
import { ITeamProps } from './team.types';
import cn from 'classnames';
import { CRM_REALIZATION_COLORS } from '@fsd/entities/crm-realization';
import { useUser } from '@fsd/shared/lib/hooks';
import { AvatarGroup, AvatarProps, Progress, TextField } from '@fsd/shared/ui-kit';
import { NumberFormat } from '@helpers';
import { HoverCard } from '@mantine/core';
import css from '../../realization-staff-report-year.module.scss';
import { Employee } from '../employee/Employee';

export const Team: FC<ITeamProps> = ({ teamReport, diff, withDiff, isFullAccess, staffHashMap }) => {
	const avatarHashMap: Map<number, Omit<AvatarProps, 'size' | 'className'>> = new Map();
	avatarHashMap.set(teamReport.userId, {
		color: teamReport.user?.color,
		text: `${teamReport.user?.lastName[0]}${teamReport.user?.firstName[0]}`,
		src: teamReport.user?.photo,
	});
	if (teamReport.user?.child)
		if (teamReport.employees && teamReport.employees.length) {
			teamReport.employees.forEach((employee) => {
				const foundUser = staffHashMap.get(employee.userId);
				avatarHashMap.set(employee.userId, {
					color: foundUser?.color,
					text: `${foundUser?.lastName[0]}${foundUser?.firstName[0]}`,
					src: foundUser?.photo,
				});
			});
		}
	if (teamReport.staffIds && teamReport.staffIds.length) {
		teamReport.staffIds.map((staffId) => {
			const foundUser = staffHashMap.get(staffId);
			avatarHashMap.set(staffId, {
				color: foundUser?.color,
				text: `${foundUser?.lastName[0]}${foundUser?.firstName[0]}`,
				src: foundUser?.photo,
			});
		});
	}
	const avatarData = Array.from(avatarHashMap).map((item) => item[1]);
	const team = useUser().getTeam();

	if (!teamReport.user) {
		return null;
	}
	return (
		<>
			<div className={css.team} key={`team_${teamReport.userId}`}>
				<div className={css.staff}>
					<AvatarGroup limit={avatarData.length} data={avatarData} size={'small'} topPosition={'left'} />
					<TextField className={css.name}>
						{teamReport.user.lastName} {teamReport.user.firstName}
					</TextField>
				</div>

				<TextField className={css.realization}>
					{isFullAccess || team?.includes(teamReport.userId) ? (
						<>
							{NumberFormat(teamReport.realization, { round: true })}
							{!!diff?.realization && withDiff && (
								<sup
									className={cn(css.sup, {
										[css.sup__positive]: diff?.realization > 0,
										[css.sup__negative]: diff?.realization < 0,
									})}
								>
									{diff?.realization > 0 ? `+${diff?.realization}` : diff?.realization}%
								</sup>
							)}
						</>
					) : (
						'-'
					)}
				</TextField>

				<TextField className={css.plan}>
					{isFullAccess || team?.includes(teamReport.userId) ? (
						<>
							{NumberFormat(teamReport.plan, { round: true })}
							{!!diff?.plan && withDiff && (
								<sup
									className={cn(css.sup, {
										[css.sup__positive]: diff?.plan > 0,
										[css.sup__negative]: diff?.plan < 0,
									})}
								>
									{diff?.plan > 0 ? `+${diff?.plan}` : diff?.plan}%
								</sup>
							)}
						</>
					) : (
						'-'
					)}
				</TextField>

				<TextField className={css.averageOrderValue}>
					{isFullAccess || team?.includes(teamReport.userId) ? (
						<>
							{NumberFormat(teamReport.averageOrderValue, { round: true })}
							{!!diff?.averageOrderValue && withDiff && (
								<sup
									className={cn(css.sup, {
										[css.sup__positive]: diff?.averageOrderValue > 0,
										[css.sup__negative]: diff?.averageOrderValue < 0,
									})}
								>
									{diff?.averageOrderValue > 0
										? `+${diff?.averageOrderValue}`
										: diff?.averageOrderValue}
									%
								</sup>
							)}
						</>
					) : (
						'-'
					)}
				</TextField>

				{isFullAccess || team?.includes(teamReport.userId) ? (
					<HoverCard withArrow position={'top-start'} arrowOffset={10} radius={'md'} openDelay={600}>
						<HoverCard.Target>
							<TextField className={css.depthOfSales}>
								{teamReport.depthOfSales ?? 0}
								{!!diff?.depthOfSales && withDiff && (
									<sup
										className={cn(css.sup, {
											[css.sup__positive]: diff?.depthOfSales > 0,
											[css.sup__negative]: diff?.depthOfSales < 0,
										})}
									>
										{diff?.depthOfSales > 0 ? `+${diff?.depthOfSales}` : diff?.depthOfSales}
									</sup>
								)}
							</TextField>
						</HoverCard.Target>
						<HoverCard.Dropdown className={css.hoverCard}>
							<TextField size={'small'}>
								Всего отгрузок: <span>{NumberFormat(teamReport.shipmentCount)}</span>
							</TextField>
							<TextField size={'small'}>
								Отгружено организаций: <span>{NumberFormat(teamReport.customerShipment)}</span>
							</TextField>
						</HoverCard.Dropdown>
					</HoverCard>
				) : (
					<TextField className={css.depthOfSales}>-</TextField>
				)}

				{isFullAccess || team?.includes(teamReport.userId) ? (
					<HoverCard withArrow position={'top-start'} arrowOffset={10} radius={'md'} openDelay={600}>
						<HoverCard.Target>
							<TextField className={css.workingBasePercent}>
								{teamReport.workingBasePercent ?? 0}%
								{!!diff?.workingBasePercent && withDiff && (
									<sup
										className={cn(css.sup, {
											[css.sup__positive]: diff?.workingBasePercent > 0,
											[css.sup__negative]: diff?.workingBasePercent < 0,
										})}
									>
										{diff?.workingBasePercent > 0
											? `+${diff?.workingBasePercent}`
											: diff?.workingBasePercent}
										%
									</sup>
								)}
							</TextField>
						</HoverCard.Target>
						<HoverCard.Dropdown className={css.hoverCard}>
							<TextField size={'small'}>
								Всего организаций: <span>{NumberFormat(teamReport.customerCount)}</span>
							</TextField>
						</HoverCard.Dropdown>
					</HoverCard>
				) : (
					<TextField className={css.workingBasePercent}>-</TextField>
				)}

				{isFullAccess || team?.includes(teamReport.userId) ? (
					<Progress
						value={teamReport.percent ?? 0}
						label={`${teamReport.percent ?? 0}%`}
						labelDirection={'right'}
						color={
							teamReport.percent && teamReport.percent < CRM_REALIZATION_COLORS.RED
								? 'red'
								: teamReport.percent &&
								  teamReport.percent >= CRM_REALIZATION_COLORS.RED &&
								  teamReport.percent < CRM_REALIZATION_COLORS.YELLOW
								? 'yellow'
								: 'green'
						}
					/>
				) : (
					'-'
				)}
			</div>

			{!!teamReport.employees?.length &&
				teamReport.employees.map((employeeReport) => (
					<Employee
						key={`employee_${employeeReport.userId}`}
						employeeReport={employeeReport}
						diff={diff?.employees.find(({ userId }) => userId === employeeReport.userId)}
						staffHashMap={staffHashMap}
						isFullAccess={isFullAccess}
						withDiff={withDiff}
					/>
				))}
		</>
	);
};
