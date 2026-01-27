import { FC, useCallback, useMemo, useState } from 'react';
import { ITeamProps } from './team.types';
import classNames from 'classnames';
import { format, parse } from 'date-fns';
import { customLocaleRu } from '@config/date-fns.locale';
import { CRM_REALIZATION_COLORS } from '@fsd/entities/crm-realization';
import { StaffAvatar } from '@fsd/entities/staff';
import { useCrmRealizationActionsPage } from '@fsd/pages/crm-report-realization';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { InputNumber, TextField } from '@fsd/shared/ui-kit';
import { NumberFormat } from '@helpers';
import { Popover } from '@mantine/core';
import css from './team.module.scss';

export const Team: FC<ITeamProps> = (props) => {
	const { user } = props;
	let { report } = props;

	const [popoverOpened, setPopoverOpened] = useState(false);
	const values = useStateSelector((state) => state.crm_realization_page.forms.planCreate);
	const errors = useStateSelector((state) => state.crm_realization_page.errors.planCreate);
	const actions = useCrmRealizationActionsPage();

	const isDisabled = useMemo(() => {
		const hasDate = values.year && values.month;
		const hasError = errors.date;
		return !hasDate || !!hasError;
	}, [values.year, values.month, errors.date]);

	const plan = useMemo(() => values.teams?.[user.id]?.plan ?? 0, [user.id, values.teams]);
	const setPlan = useCallback(
		(userId: number, value: number) => {
			actions.setFormPlanCreate({
				teams: {
					[userId]: {
						plan: value,
					},
				},
			});
		},
		[actions]
	);

	const planCustomerCount = useMemo(() => values.teams?.[user.id]?.planCustomerCount ?? 0, [user.id, values.teams]);
	const setPlanCustomerCount = useCallback(
		(userId: number, value: number) => {
			actions.setFormPlanCreate({
				teams: {
					[userId]: {
						planCustomerCount: value,
					},
				},
			});
		},
		[actions]
	);

	const planWorkingBasePercent = useMemo(
		() => values.teams?.[user.id]?.planWorkingBasePercent ?? 0,
		[user.id, values.teams]
	);
	const setPlanWorkingBasePercent = useCallback(
		(userId: number, value: number) => {
			actions.setFormPlanCreate({
				teams: {
					[userId]: {
						planWorkingBasePercent: value,
					},
				},
			});
		},
		[actions]
	);

	const valueDiff = useMemo(() => {
		return plan - (report?.data.plan ?? 0);
	}, [report?.data.plan, plan]);

	// const toggleShowEmployees = useCallback(() => {
	// 	if (!values.teams) {
	// 		return;
	// 	}

	// 	const employees: Record<number, { userId: number; plan: number }> | null = !showEmployees ? {} : {};
	// 	if (employees) {
	// 		clone(planAll?.last?.downToTeams.linkedList[user.id].data.employees)?.forEach((employeesReport) => {
	// 			employees[employeesReport.userId] = {
	// 				userId: employeesReport.userId,
	// 				plan: employeesReport.plan ?? 0,
	// 			};
	// 		});
	// 	}
	// 	actions.setFormPlanCreate({
	// 		teams: {
	// 			[user.id]: {
	// 				plan: showEmployees
	// 					? planAll?.last?.downToTeams.linkedList[user.id].data.plan ?? 0
	// 					: Object.values(employees).reduce((acc, curr) => (acc += curr.plan), 0),
	// 				employees,
	// 			},
	// 		},
	// 	});

	// 	setShowEmployees((old) => !old);
	// }, [values.teams, showEmployees, actions, user.id, planAll?.last?.downToTeams.linkedList]);

	return (
		<>
			<Popover opened={popoverOpened} position={'right'} radius={'md'} shadow={'xl'} withArrow>
				<Popover.Target>
					<div
						className={css.item}
						onFocusCapture={() => setPopoverOpened(true)}
						onBlurCapture={() => setPopoverOpened(false)}
					>
						<StaffAvatar user={user} />

						<InputNumber
							label={
								<>
									{user.lastName} {user.firstName}{' '}
									{!!plan && !!valueDiff && NumberFormat(valueDiff, { sup: true, operator: true })}
								</>
							}
							value={plan}
							onChange={(val) => setPlan(user.id, val ?? 0)}
							step={100000000}
							min={0}
							disabled={isDisabled}
						/>

						<InputNumber
							label={'База орг.'}
							value={planCustomerCount}
							onChange={(val) => setPlanCustomerCount(user.id, val ?? 0)}
							step={1}
							min={0}
							disabled={isDisabled}
						/>

						<InputNumber
							label={'% актив. орг.'}
							value={planWorkingBasePercent}
							onChange={(val) => setPlanWorkingBasePercent(user.id, val ?? 0)}
							step={1}
							min={0}
							max={100}
							disabled={isDisabled}
						/>

						{/* {!!user.child?.length && (
							<Icon
								name={'realization-team'}
								className={css.iconTeam}
								onClick={toggleShowEmployees}
								disabled={!values.year || !values.month}
							/>
						)} */}
					</div>
				</Popover.Target>
				<Popover.Dropdown className={css.hoverCard}>
					<TextField className={css.hoverCard__name}>
						{user.lastName} {user.firstName}
					</TextField>

					<div className={css.hoverCard__data}>
						{Array.from({ length: 6 }, () => 0).map((_, i) => {
							if (i != 0 && report?.prev) {
								report = report?.prev;
							}
							if (!report) {
								return null;
							}
							return (
								<div key={`team_${user.id}_${report?.data.year}_${report?.data.month}`}>
									<TextField size={'small'} className={css.hoverCard__date}>
										{format(
											parse(`${report?.data.year}-${report?.data.month}`, 'yyyy-M', new Date()),
											'yyyy LLLL',
											{ locale: customLocaleRu }
										)}
									</TextField>

									<TextField size={'small'} className={css.hoverCard__number}>
										<span className={css.realization}>
											{NumberFormat(report?.data.realization, { round: true })}
										</span>
										{' / '}
										<span className={css.plan}>{NumberFormat(report?.data.plan)}</span>
										<span
											className={classNames(css.percent, {
												[css.percent__red]:
													(report?.data?.percent ?? 0) < CRM_REALIZATION_COLORS.RED,
												[css.percent__yellow]:
													(report?.data?.percent ?? 0) >= CRM_REALIZATION_COLORS.RED &&
													(report?.data?.percent ?? 0) < CRM_REALIZATION_COLORS.YELLOW,
												[css.percent__green]:
													(report?.data?.percent ?? 0) >= CRM_REALIZATION_COLORS.YELLOW,
											})}
										>
											{report?.data.percent}%
										</span>
									</TextField>

									<TextField size={'small'} className={css.hoverCard__customers}>
										Организаций: <strong>{report?.data?.customerCount}</strong>
									</TextField>
								</div>
							);
						})}
					</div>
				</Popover.Dropdown>
			</Popover>

			{/* {user.child && user.child.length > 1 && showEmployees && (
				<>
					<Employee
						user={user}
						parentUserId={user.id}
						report={report?.upToAll?.last?.downToEmployees?.linkedList?.[user.id] ?? null}
					/>

					{user.child.map((childUser) => (
						<Employee
							key={`employee_${childUser.id}`}
							user={childUser}
							parentUserId={user.id}
							report={report?.upToAll?.last?.downToEmployees?.linkedList?.[childUser.id] ?? null}
						/>
					))}
				</>
			)} */}
		</>
	);
};
