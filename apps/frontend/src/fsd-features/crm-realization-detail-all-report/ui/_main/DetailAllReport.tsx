import { FC, memo, useEffect, useMemo } from 'react';
import { IDetailAllReportProps } from './detail-all-report.types';
import { CRM_REALIZATION_COLORS, ICrmRealizationMonthResEmployee } from '@fsd/entities/crm-realization';
import { StaffAvatar, StaffMenu } from '@fsd/entities/staff';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Progress, TextField } from '@fsd/shared/ui-kit';
import { NumberFormat, NumberFormatAbbreviations } from '@helpers';
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
								return;
							}

							const employeeReports: ICrmRealizationMonthResEmployee[] =
								JSON.parse(JSON.stringify(teamReport.employees)) ?? [];
							if (employeeReports && employeeReports.length > 1) {
								employeeReports.sort((a, b) => (b.realization ?? 0) - (a.realization ?? 0));
							}

							let workingBasePlan = 0;
							if (teamReport.planWorkingBasePercent && teamReport.workingBasePercent) {
								workingBasePlan =
									(teamReport.workingBasePercent / teamReport.planWorkingBasePercent) * 100;
							}

							let customerCountPlan = 0;
							if (teamReport.customerCount && teamReport.planCustomerCount) {
								customerCountPlan = (teamReport.customerCount / teamReport.planCustomerCount) * 100;
							}

							return (
								<>
									<div key={`team_${teamReport.userId}`} className={css.team}>
										<StaffAvatar user={foundUser} size={'small'} className={css.team__avatar} />
										<StaffMenu user={foundUser} className={css.team__staff}>
											<TextField className={css.team__name} size={'small'}>
												{foundUser.lastName} {foundUser.firstName}
											</TextField>

											<TextField className={css.team__realization} size={'small'}>
												<span>{NumberFormat(teamReport.realization, { round: true })}</span>
												{' / '}
												{NumberFormatAbbreviations(teamReport.plan ?? 0)}
											</TextField>
										</StaffMenu>

										<div>
											<Tooltip
												label={`План реализации выполнен на ${teamReport.percent ?? 0}%`}
												withArrow
												multiline
												w={160}
												position="right"
												offset={-10}
											>
												<div>
													<Progress
														value={teamReport.percent ?? 0}
														size={'extraSmall'}
														color={
															teamReport.percent &&
															teamReport.percent < CRM_REALIZATION_COLORS.RED
																? 'red'
																: teamReport.percent &&
																	  teamReport.percent >=
																			CRM_REALIZATION_COLORS.RED &&
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
													multiline
													w={220}
													position="right"
													offset={-10}
												>
													<div>
														<Progress
															value={customerCountPlan ?? 0}
															size={'extraSmall'}
															color={
																customerCountPlan &&
																customerCountPlan < CRM_REALIZATION_COLORS.RED
																	? 'red'
																	: customerCountPlan &&
																		  customerCountPlan >=
																				CRM_REALIZATION_COLORS.RED &&
																		  customerCountPlan <
																				CRM_REALIZATION_COLORS.YELLOW
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
													label={`План активной базы: ${
														teamReport.planWorkingBasePercent ?? 0
													}%. Сейчас: ${teamReport.workingBasePercent ?? 0}%`}
													withArrow
													multiline
													w={200}
													position="right"
													offset={-10}
												>
													<div>
														<Progress
															value={workingBasePlan ?? 0}
															size={'extraSmall'}
															color={
																workingBasePlan &&
																workingBasePlan < CRM_REALIZATION_COLORS.RED
																	? 'red'
																	: workingBasePlan &&
																		  workingBasePlan >=
																				CRM_REALIZATION_COLORS.RED &&
																		  workingBasePlan <
																				CRM_REALIZATION_COLORS.YELLOW
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
									</div>

									{!!employeeReports?.length &&
										employeeReports.map((employeeReport) => {
											const foundUser = staffAll.find(
												(user) => user.id === employeeReport.userId
											);
											if (!foundUser) {
												return;
											}
											return (
												<div className={css.employee} key={`employee_${employeeReport.userId}`}>
													<TextField className={css.employee__arrow} size={'small'}>
														∟
													</TextField>

													<StaffAvatar
														user={foundUser}
														size={'extraSmall'}
														className={css.team__avatar}
													/>

													<TextField size={'small'} className={css.employee__name}>
														{foundUser.lastName} {foundUser.firstName}
														{!!employeeReport.percent && (
															<span>{employeeReport.percent}%</span>
														)}
													</TextField>

													<TextField className={css.team__realization} size={'small'}>
														<span>
															{NumberFormat(employeeReport.realization, {
																round: true,
															})}
														</span>
														{' / '}
														{NumberFormat(employeeReport.plan)}
													</TextField>
												</div>
											);
										})}
								</>
							);
						})}
				</div>
			</ScrollArea>
		</div>
	);
});
DetailAllReport.displayName = 'DetailAllReport';
