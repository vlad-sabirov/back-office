import { FC, memo } from 'react';
import { IDetailAllReportProps } from './detail-all-report.types';
import { CRM_REALIZATION_COLORS } from '@fsd/entities/crm-realization';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { AvatarGroup, AvatarProps, Progress, TextField } from '@fsd/shared/ui-kit';
import { NumberFormat } from '@helpers';
import { ScrollArea, Tooltip } from '@mantine/core';
import css from './detail-all-report.module.scss';

export const DetailAllReport: FC<IDetailAllReportProps> = memo((props) => {
	const { data, height } = props;
	const currentData = data?.downToTeams?.toArray() || [];

	const staffAll = useStateSelector((state) => state.staff.data.all);

	if (!data) {
		return null;
	}
	return (
		<div>
			<TextField size={'small'} mode={'heading'}>
				Отчет по сотрудникам
			</TextField>

			<ScrollArea style={{ height }}>
				<div className={css.wrapper}>
					{currentData
						.sort((a, b) => (b.realization ?? 0) - (a.realization ?? 0))
						.map((teamReport) => {
							const foundUser = staffAll.find((user) => user.id === teamReport.userId);
							if (!foundUser) {
								return null;
							}

							const childUsers = foundUser.child?.filter((c) => !c.isFired) || [];
							const avatars: Omit<AvatarProps, 'size' | 'className'>[] = [
								{ color: foundUser.color, text: `${foundUser.lastName[0]}${foundUser.firstName[0]}`, src: foundUser.photo },
								...childUsers.map((c) => ({
									color: c.color, text: `${c.lastName[0]}${c.firstName[0]}`, src: c.photo,
								})),
							];

							const customerCountPercent = teamReport.customerCount && teamReport.planCustomerCount
								? (teamReport.customerCount / teamReport.planCustomerCount) * 100
								: 0;

							const workingBasePercent = teamReport.workingBasePercent && teamReport.planWorkingBasePercent
								? (teamReport.workingBasePercent / teamReport.planWorkingBasePercent) * 100
								: 0;

							const getColor = (v: number) =>
								v < CRM_REALIZATION_COLORS.RED ? 'red'
								: v < CRM_REALIZATION_COLORS.YELLOW ? 'yellow'
								: 'green';

							return (
								<div key={`team_${teamReport.userId}`} className={css.row}>
									<div className={css.row__staff}>
										<AvatarGroup data={avatars} limit={avatars.length} size={'small'} topPosition={'left'} />
										<div className={css.row__info}>
											<TextField className={css.row__name} size={'small'}>
												{foundUser.lastName} {foundUser.firstName}
											</TextField>
											<TextField className={css.row__value} size={'small'}>
												{NumberFormat(teamReport.realization, { round: true })}
												<span> / {NumberFormat(teamReport.plan ?? 0, { round: true })}</span>
											</TextField>
										</div>
									</div>

									<div className={css.row__bars}>
											<Tooltip label={`План реализации выполнен на ${teamReport.percent ?? 0}%`} withArrow position="right" offset={-10}>
												<div>
													<Progress value={teamReport.percent ?? 0} size={'extraSmall'} color={getColor(teamReport.percent ?? 0)} />
												</div>
											</Tooltip>

											{!!teamReport.planCustomerCount && (
												<Tooltip label={`План базы: ${teamReport.planCustomerCount}. Сейчас: ${teamReport.customerCount ?? 0}`} withArrow position="right" offset={-10}>
													<div>
														<Progress value={customerCountPercent} size={'extraSmall'} color={getColor(customerCountPercent)} />
													</div>
												</Tooltip>
											)}

											{!!teamReport.planWorkingBasePercent && (
												<Tooltip label={`План активной базы: ${teamReport.planWorkingBasePercent}%. Сейчас: ${teamReport.workingBasePercent ?? 0}%`} withArrow position="right" offset={-10}>
													<div>
														<Progress value={workingBasePercent} size={'extraSmall'} color={getColor(workingBasePercent)} />
													</div>
												</Tooltip>
											)}
										</div>
								</div>
							);
						})}
				</div>
			</ScrollArea>
		</div>
	);
});
DetailAllReport.displayName = 'DetailAllReport';
