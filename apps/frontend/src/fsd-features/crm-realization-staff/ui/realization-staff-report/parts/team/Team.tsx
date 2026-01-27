import { FC } from 'react';
import { ITeamProps } from './team.types';
import cn from 'classnames';
import { CRM_REALIZATION_COLORS, ICrmRealizationMonthResEmployee } from '@fsd/entities/crm-realization';
import { StaffMenu } from '@fsd/entities/staff';
import { AvatarGroup, AvatarProps, Icon, Menu, Progress, TextField } from '@fsd/shared/ui-kit';
import { NumberFormat } from '@helpers';
import { useUserDeprecated } from '@hooks';
import { HoverCard, Tooltip } from '@mantine/core';
import css from '../../realization-staff-report.module.scss';
import { Employee } from '../employee/Employee';

export const Team: FC<ITeamProps> = (props) => {
	const { teamReport, dataReport, withDiff, isFullAccess, staffHashMap, setCurrentReport, setIsShowWhatIf } = props;

	const foundUser = staffHashMap.get(teamReport.userId);
	const avatarHashMap: Map<number, Omit<AvatarProps, 'size' | 'className'>> = new Map();
	avatarHashMap.set(teamReport.userId, {
		color: foundUser?.color,
		text: `${foundUser?.lastName[0]}${foundUser?.firstName[0]}`,
		src: foundUser?.photo,
	});
	if (foundUser?.child)
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
	const { team } = useUserDeprecated();
	const report = dataReport?.downToTeams.linkedList[teamReport.userId];
	const dataDiff = report?.diff(report.prev);

	let workingBasePlan = 0;
	if (teamReport.planWorkingBasePercent && teamReport.workingBasePercent) {
		workingBasePlan = (teamReport.workingBasePercent / teamReport.planWorkingBasePercent) * 100;
	}

	let customerCountPlan = 0;
	if (teamReport.customerCount && teamReport.planCustomerCount) {
		customerCountPlan = (teamReport.customerCount / teamReport.planCustomerCount) * 100;
	}

	if (!foundUser) {
		return null;
	}
	return (
		<>
			<div className={css.team} key={`team_${teamReport.userId}`}>
				<StaffMenu
					user={foundUser}
					className={css.staff}
					content={
						<>
							<Menu.Item
								color={'blue'}
								icon={<Icon name={'slider'} />}
								onClick={() => {
									setIsShowWhatIf?.(true);
									setCurrentReport?.(teamReport);
								}}
							>
								Что если?
							</Menu.Item>
						</>
					}
				>
					<AvatarGroup limit={avatarData.length} data={avatarData} size={'small'} topPosition={'left'} />
					<TextField className={css.name}>
						{foundUser.lastName} {foundUser.firstName}
					</TextField>
				</StaffMenu>

				<TextField className={css.realization}>
					{isFullAccess || team?.includes(teamReport.userId) ? (
						<>
							{NumberFormat(teamReport.realization, { round: true })}
							{!!dataDiff?.realization && withDiff && (
								<sup
									className={cn(css.sup, {
										[css.sup__positive]: dataDiff?.realization > 0,
										[css.sup__negative]: dataDiff?.realization < 0,
									})}
								>
									{dataDiff?.realization > 0 ? `+${dataDiff?.realization}` : dataDiff?.realization}%
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
							{!!dataDiff?.plan && withDiff && (
								<sup
									className={cn(css.sup, {
										[css.sup__positive]: dataDiff?.plan > 0,
										[css.sup__negative]: dataDiff?.plan < 0,
									})}
								>
									{dataDiff?.plan > 0 ? `+${dataDiff?.plan}` : dataDiff?.plan}%
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
							{!!dataDiff?.averageOrderValue && withDiff && (
								<sup
									className={cn(css.sup, {
										[css.sup__positive]: dataDiff?.averageOrderValue > 0,
										[css.sup__negative]: dataDiff?.averageOrderValue < 0,
									})}
								>
									{dataDiff?.averageOrderValue > 0
										? `+${dataDiff?.averageOrderValue}`
										: dataDiff?.averageOrderValue}
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
								{!!dataDiff?.depthOfSales && withDiff && (
									<sup
										className={cn(css.sup, {
											[css.sup__positive]: dataDiff?.depthOfSales > 0,
											[css.sup__negative]: dataDiff?.depthOfSales < 0,
										})}
									>
										{dataDiff?.depthOfSales > 0
											? `+${dataDiff?.depthOfSales}`
											: dataDiff?.depthOfSales}
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
								{!!dataDiff?.workingBasePercent && withDiff && (
									<sup
										className={cn(css.sup, {
											[css.sup__positive]: dataDiff?.workingBasePercent > 0,
											[css.sup__negative]: dataDiff?.workingBasePercent < 0,
										})}
									>
										{dataDiff?.workingBasePercent > 0
											? `+${dataDiff?.workingBasePercent}`
											: dataDiff?.workingBasePercent}
										%
									</sup>
								)}
							</TextField>
						</HoverCard.Target>
						<HoverCard.Dropdown className={css.hoverCard}>
							<TextField size={'small'}>
								Всего организаций: <span>{NumberFormat(teamReport.customerCount)}</span>
							</TextField>
							<TextField size={'small'}>
								Отгружено организаций: <span>{NumberFormat(teamReport.customerShipment)}</span>
							</TextField>
						</HoverCard.Dropdown>
					</HoverCard>
				) : (
					<TextField className={css.workingBasePercent}>-</TextField>
				)}

				{isFullAccess || team?.includes(teamReport.userId) ? (
					<div>
						<Tooltip
							label={`План реализации выполнен на ${teamReport.percent ?? 0}%`}
							withArrow
							position="right"
							offset={-10}
						>
							<div>
								<Progress
									value={teamReport.percent ?? 0}
									size={'extraSmall'}
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
							</div>
						</Tooltip>

						{teamReport.planCustomerCount ? (
							<Tooltip
								label={`План базы: ${teamReport.planCustomerCount ?? 0}. Сейчас: ${
									teamReport.customerCount ?? 0
								}`}
								withArrow
								position="right"
								offset={-10}
							>
								<div>
									<Progress
										value={customerCountPlan ?? 0}
										size={'extraSmall'}
										color={
											customerCountPlan && customerCountPlan < CRM_REALIZATION_COLORS.RED
												? 'red'
												: customerCountPlan &&
												  customerCountPlan >= CRM_REALIZATION_COLORS.RED &&
												  customerCountPlan < CRM_REALIZATION_COLORS.YELLOW
												? 'yellow'
												: 'green'
										}
									/>
								</div>
							</Tooltip>
						) : (
							''
						)}

						{teamReport.planWorkingBasePercent ? (
							<Tooltip
								label={`План активной базы: ${teamReport.planWorkingBasePercent ?? 0}%. Сейчас: ${
									teamReport.workingBasePercent ?? 0
								}%`}
								withArrow
								position="right"
								offset={-10}
							>
								<div>
									<Progress
										value={workingBasePlan ?? 0}
										size={'extraSmall'}
										color={
											workingBasePlan && workingBasePlan < CRM_REALIZATION_COLORS.RED
												? 'red'
												: workingBasePlan &&
												  workingBasePlan >= CRM_REALIZATION_COLORS.RED &&
												  workingBasePlan < CRM_REALIZATION_COLORS.YELLOW
												? 'yellow'
												: 'green'
										}
									/>
								</div>
							</Tooltip>
						) : (
							''
						)}
					</div>
				) : (
					'-'
				)}
			</div>

			{!!teamReport.employees?.length &&
				JSON.parse(JSON.stringify(teamReport.employees))
					?.sort(
						(a: ICrmRealizationMonthResEmployee, b: ICrmRealizationMonthResEmployee) =>
							(b.realization ?? 0) - (a.realization ?? 0)
					)
					.map((employeeReport: ICrmRealizationMonthResEmployee) => (
						<Employee
							key={`employee_${employeeReport.userId}`}
							employeeReport={employeeReport}
							dataReport={dataReport}
							staffHashMap={staffHashMap}
							isFullAccess={isFullAccess}
							withDiff={withDiff}
							setIsShowWhatIf={setIsShowWhatIf}
							setCurrentReport={setCurrentReport}
						/>
					))}
		</>
	);
};
