import { FC } from 'react';
import { IEmployeeProps } from './employee.types';
import cn from 'classnames';
import { CRM_REALIZATION_COLORS } from '@fsd/entities/crm-realization';
import { useUser } from '@fsd/shared/lib/hooks';
import { AvatarGroup, AvatarProps, Progress, TextField } from '@fsd/shared/ui-kit';
import { NumberFormat } from '@helpers';
import { HoverCard } from '@mantine/core';
import css from '../../realization-staff-report-year.module.scss';

export const Employee: FC<IEmployeeProps> = ({ employeeReport, diff, withDiff, isFullAccess }) => {
	const avatarHashMap: Map<number, Omit<AvatarProps, 'size' | 'className'>> = new Map();
	avatarHashMap.set(employeeReport.userId, {
		color: employeeReport.user?.color,
		text: `${employeeReport.user?.lastName[0]}${employeeReport.user?.firstName[0]}`,
		src: employeeReport.user?.photo,
	});
	const avatarData = Array.from(avatarHashMap).map((item) => item[1]);
	const team = useUser().getTeam();

	return (
		<>
			<div className={css.employee} key={`team_${employeeReport.userId}`}>
				<TextField size={'small'} className={css.arrow}>
					∟
				</TextField>
				<div className={css.staff}>
					<AvatarGroup limit={avatarData.length} data={avatarData} size={'extraSmall'} topPosition={'left'} />
					<TextField className={css.name}>
						{employeeReport.user?.lastName} {employeeReport.user?.firstName}
					</TextField>
				</div>

				<TextField size={'small'} className={css.realization}>
					{isFullAccess || team?.includes(employeeReport.userId) ? (
						<>
							{NumberFormat(employeeReport.realization, { round: true })}
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

				<TextField size={'small'} className={css.plan}>
					{isFullAccess || team?.includes(employeeReport.userId) ? (
						<>
							{NumberFormat(employeeReport.plan, { round: true })}
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

				<TextField size={'small'} className={css.averageOrderValue}>
					{isFullAccess || team?.includes(employeeReport.userId) ? (
						<>
							{NumberFormat(employeeReport.averageOrderValue, { round: true })}
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

				{isFullAccess || team?.includes(employeeReport.userId) ? (
					<HoverCard withArrow position={'top-start'} arrowOffset={10} radius={'md'} openDelay={600}>
						<HoverCard.Target>
							<TextField size={'small'} className={css.depthOfSales}>
								{employeeReport.depthOfSales ?? 0}
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
								Всего отгрузок: <span>{NumberFormat(employeeReport.shipmentCount)}</span>
							</TextField>
							<TextField size={'small'}>
								Отгружено организаций: <span>{NumberFormat(employeeReport.customerShipment)}</span>
							</TextField>
						</HoverCard.Dropdown>
					</HoverCard>
				) : (
					<TextField className={css.depthOfSales}>-</TextField>
				)}

				{isFullAccess || team?.includes(employeeReport.userId) ? (
					<HoverCard withArrow position={'top-start'} arrowOffset={10} radius={'md'} openDelay={600}>
						<HoverCard.Target>
							<TextField size={'small'} className={css.workingBasePercent}>
								{employeeReport.workingBasePercent ?? 0}%
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
								Всего организаций: <span>{NumberFormat(employeeReport.customerCount)}</span>
							</TextField>
							<TextField size={'small'}>
								Отгружено организаций: <span>{NumberFormat(employeeReport.customerShipment)}</span>
							</TextField>
						</HoverCard.Dropdown>
					</HoverCard>
				) : (
					<TextField className={css.workingBasePercent}>-</TextField>
				)}

				{isFullAccess || team?.includes(employeeReport.userId) ? (
					<Progress
						value={employeeReport.percent ?? 0}
						label={`${employeeReport.percent ?? 0}%`}
						labelDirection={'right'}
						size={'extraSmall'}
						color={
							employeeReport.percent && employeeReport.percent < CRM_REALIZATION_COLORS.RED
								? 'red'
								: employeeReport.percent &&
								  employeeReport.percent >= CRM_REALIZATION_COLORS.RED &&
								  employeeReport.percent < CRM_REALIZATION_COLORS.YELLOW
								? 'yellow'
								: 'green'
						}
					/>
				) : (
					'-'
				)}
			</div>
		</>
	);
};
