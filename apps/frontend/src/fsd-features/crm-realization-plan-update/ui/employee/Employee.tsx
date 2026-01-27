import { FC, useCallback, useMemo, useState } from 'react';
import { IEmployeeProps } from './employee.types';
import classNames from 'classnames';
import { format, parse } from 'date-fns';
import { clone } from 'lodash';
import { customLocaleRu } from '@config/date-fns.locale';
import { CRM_REALIZATION_COLORS } from '@fsd/entities/crm-realization';
import { StaffAvatar } from '@fsd/entities/staff';
import { useCrmRealizationActionsPage } from '@fsd/pages/crm-report-realization';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { InputNumber, TextField } from '@fsd/shared/ui-kit';
import { NumberFormat } from '@helpers';
import { Popover } from '@mantine/core';
import css from './employee.module.scss';

export const Employee: FC<IEmployeeProps> = (props) => {
	const { user, parentUserId } = props;
	let { report } = props;

	const [popoverOpened, setPopoverOpened] = useState(false);
	const values = useStateSelector((state) => state.crm_realization_page.forms.planUpdate);
	const errors = useStateSelector((state) => state.crm_realization_page.errors.planUpdate);
	const actions = useCrmRealizationActionsPage();

	const isDisabled = useMemo(() => {
		const hasDate = values.year && values.month;
		const hasError = errors.date;
		return !hasDate || !!hasError;
	}, [values.year, values.month, errors.date]);

	const value = useMemo(
		() => values.teams?.[parentUserId]?.employees?.[user.id]?.plan ?? 0,
		[parentUserId, user.id, values.teams]
	);
	const setValue = useCallback(
		(value: number) => {
			if (!values.teams) {
				return;
			}
			const employees = clone(values.teams[parentUserId].employees);

			if (!employees) {
				return;
			}
			employees[user.id] = { plan: value };
			const team = clone(values.teams[parentUserId]);
			team.plan = Object.values(employees).reduce((acc, curr) => (acc += curr.plan ?? 0), 0);
			team.employees = employees;
			actions.setFormPlanUpdate({
				teams: {
					[parentUserId]: team,
				},
			});
		},
		[actions, parentUserId, user.id, values.teams]
	);
	const valueDiff = useMemo(() => {
		return value - (report?.data.plan ?? 0);
	}, [report?.data.plan, value]);

	return (
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
								{!!value && !!valueDiff && NumberFormat(valueDiff, { sup: true, operator: true })}
							</>
						}
						value={value}
						onChange={(val) => setValue(val ?? 0)}
						step={100000000}
						disabled={isDisabled}
					/>
				</div>
			</Popover.Target>
			<Popover.Dropdown className={css.hoverCard}>
				<TextField className={css.hoverCard__name}>
					{user.lastName} {user.firstName}
				</TextField>

				<div className={css.hoverCard__data}>
					{Array.from({ length: 6 }, () => 0).map((_, i) => {
						if (i != 0) {
							report = report?.prev ?? null;
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
							</div>
						);
					})}
				</div>
			</Popover.Dropdown>
		</Popover>
	);
};
