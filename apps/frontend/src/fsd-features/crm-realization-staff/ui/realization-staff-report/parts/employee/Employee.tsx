import { FC } from 'react';
import { IEmployeeProps } from './employee.types';
import cn from 'classnames';
import { CRM_REALIZATION_COLORS } from '@fsd/entities/crm-realization';
import { StaffMenu } from '@fsd/entities/staff';
import { AvatarGroup, AvatarProps, Icon, Menu, Progress, TextField } from '@fsd/shared/ui-kit';
import { NumberFormat } from '@helpers';
import { useUserDeprecated } from '@hooks';
import { HoverCard } from '@mantine/core';
import css from '../../realization-staff-report.module.scss';

export const Employee: FC<IEmployeeProps> = (props) => {
	const { employeeReport, dataReport, withDiff, isFullAccess, staffHashMap, setCurrentReport, setIsShowWhatIf } =
		props;

	const foundUser = staffHashMap.get(employeeReport.userId);
	const avatarHashMap: Map<number, Omit<AvatarProps, 'size' | 'className'>> = new Map();
	avatarHashMap.set(employeeReport.userId, {
		color: foundUser?.color,
		text: `${foundUser?.lastName[0]}${foundUser?.firstName[0]}`,
		src: foundUser?.photo,
	});
	const avatarData = Array.from(avatarHashMap).map((item) => item[1]);
	const { team } = useUserDeprecated();
	const report = dataReport?.downToEmployees?.linkedList?.[employeeReport.userId];
	const dataDiff = report?.diff(report.prev);

	if (!foundUser) {
		return null;
	}
	return (
		<>
			<div className={css.employee} key={`team_${employeeReport.userId}`}>
				<TextField size={'small'} className={css.arrow}>
					∟
				</TextField>
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
									setCurrentReport?.(employeeReport);
								}}
							>
								Что если?
							</Menu.Item>
						</>
					}
				>
					<AvatarGroup limit={avatarData.length} data={avatarData} size={'extraSmall'} topPosition={'left'} />
					<TextField className={css.name}>
						{foundUser.lastName} {foundUser.firstName}
					</TextField>
				</StaffMenu>

				<TextField size={'small'} className={css.realization}>
					{isFullAccess || team?.includes(employeeReport.userId) ? (
						<>
							{NumberFormat(employeeReport.realization, { round: true })}
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

				<TextField size={'small'} className={css.plan}>
					{isFullAccess || team?.includes(employeeReport.userId) ? (
						<>
							{NumberFormat(employeeReport.plan, { round: true })}
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

				<TextField size={'small'} className={css.averageOrderValue}>
					{isFullAccess || team?.includes(employeeReport.userId) ? (
						<>
							{NumberFormat(employeeReport.averageOrderValue, { round: true })}
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

				{isFullAccess || team?.includes(employeeReport.userId) ? (
					<HoverCard withArrow position={'top-start'} arrowOffset={10} radius={'md'} openDelay={600}>
						<HoverCard.Target>
							<TextField size={'small'} className={css.depthOfSales}>
								{employeeReport.depthOfSales ?? 0}
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
