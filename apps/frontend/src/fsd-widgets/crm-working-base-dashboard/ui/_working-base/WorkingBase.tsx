import { FC, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { format, parse, subMonths } from 'date-fns';
import { IconBattery } from '@fsd/entities/crm-organization/ui/icon-battery/IconBattery';
import { ICrmWorkingBaseUserRes, useCrmWorkingDiff } from '@fsd/entities/crm-working-base';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { ContentBlock, TextField } from '@fsd/shared/ui-kit';
import { NumberFormat } from '@helpers';
import { useUserDeprecated } from '@hooks';
import { Grid } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import css from './working-base.module.scss';

export const WorkingBase: FC = () => {
	const { user, parent, rolesAlias } = useUserDeprecated();
	const [spanCount, setSpanCount] = useState<number>(25);
	const { width: screenWidth } = useViewportSize();
	const teamIds = useMemo(() => {
		if (!user?.id) {
			return [];
		}
		const ids: number[] = [user.id];
		if (user?.parent?.id) {
			ids.push(user.parent.id);
		}
		if (user?.parent?.child?.length) {
			for (const child of user.parent.child) {
				ids.push(child.id);
			}
		}
		if (user?.children?.length) {
			for (const child of user.children) {
				ids.push(child.id);
			}
		}
		return ids;
	}, [user]);

	const reportAll = useStateSelector((state) => state.crm_working_base.data.all);
	const reportLast = useStateSelector((state) => state.crm_working_base.data.allLast);
	const reportPrevDate: string = useMemo(() => {
		if (!reportLast) {
			return '';
		}
		return format(subMonths(parse(`${reportLast?.year}-${reportLast?.month}`, `yyyy-MM`, new Date()), 1), 'yyyy-M');
	}, [reportLast]);

	// User
	const reportUser = useMemo(() => {
		if (!user?.id || !reportLast) {
			return null;
		}
		return reportLast.users?.find((report) => report.userId === user.id) ?? null;
	}, [reportLast, user?.id]);
	const reportUserPrev = useMemo(() => {
		if (!user?.id || !reportLast) {
			return null;
		}
		return reportAll[reportPrevDate].users?.find((report) => report.userId === user.id) ?? null;
	}, [reportAll, reportLast, reportPrevDate, user?.id]);
	const diffUser = useCrmWorkingDiff(reportUser, reportUserPrev);

	// Parent
	const reportParent: ICrmWorkingBaseUserRes | null = useMemo(() => {
		if (!user?.id || !reportLast) {
			return null;
		}
		return (
			reportLast.users
				?.filter((report) => teamIds?.includes(report.userId) || report.userId === (parent || user.id))
				.reduce(
					(acc, curr) => {
						acc.total += curr.total;
						acc.low += curr.low;
						acc.medium += curr.medium;
						acc.active += curr.active;
						acc.empty += curr.empty;
						return acc;
					},
					{
						userId: 0,
						low: 0,
						medium: 0,
						active: 0,
						total: 0,
						empty: 0,
						updatedAt: '',
						createdAt: '',
					}
				) ?? null
		);
	}, [user?.id, reportLast, teamIds, parent]);
	const reportParentPrev = useMemo(() => {
		if (!user?.id || !reportLast) {
			return null;
		}
		return (
			reportAll[reportPrevDate].users
				?.filter((report) => teamIds?.includes(report.userId) || report.userId === (parent || user.id))
				.reduce(
					(acc, curr) => {
						acc.total += curr.total;
						acc.low += curr.low;
						acc.medium += curr.medium;
						acc.active += curr.active;
						acc.empty += curr.empty;
						return acc;
					},
					{
						userId: 0,
						low: 0,
						medium: 0,
						active: 0,
						total: 0,
						empty: 0,
						updatedAt: '',
						createdAt: '',
					}
				) ?? null
		);
	}, [parent, reportAll, reportLast, reportPrevDate, teamIds, user?.id]);
	const diffParent = useCrmWorkingDiff(reportParent, reportParentPrev);

	useEffect(() => {
		if (screenWidth >= 100 && screenWidth <= 850) setSpanCount(100);
		if (screenWidth >= 850 && screenWidth <= 950) setSpanCount(60);
		if (screenWidth >= 950 && screenWidth <= 1000) setSpanCount(50);
		if (screenWidth >= 1000 && screenWidth <= 1150) setSpanCount(45);
		if (screenWidth >= 1150 && screenWidth <= 1250) setSpanCount(40);
		if (screenWidth >= 1250 && screenWidth <= 1400) setSpanCount(35);
		if (screenWidth >= 1400 && screenWidth <= 1600) setSpanCount(30);
		if (screenWidth >= 1600 && screenWidth <= 1800) setSpanCount(25);
		if (screenWidth >= 1800 && screenWidth <= 2000) setSpanCount(23);
		if (screenWidth >= 2000 && screenWidth <= 2300) setSpanCount(20);
		if (screenWidth >= 2300 && screenWidth <= 2500) setSpanCount(17);
		if (screenWidth >= 2500 && screenWidth <= 2900) setSpanCount(15);
		if (screenWidth >= 2900 && screenWidth <= 3150) setSpanCount(13);
		if (screenWidth >= 3150 && screenWidth <= 3600) setSpanCount(12);
	}, [screenWidth]);

	if ((!reportUser && !reportParent) || !rolesAlias?.includes('crm')) {
		return null;
	}

	return (
		<>
			{!!reportUser?.total && (
				<Grid.Col span={spanCount}>
					<ContentBlock className={css.root}>
						<TextField className={css.workingBaseAll} size={'large'}>
							Моих организаций:
							<span>
								{reportUser.total}
								{diffUser &&
									!!diffUser.totalPercent &&
									NumberFormat(diffUser.totalPercent, { sup: true, operator: true, after: '%' })}
							</span>
						</TextField>

						<TextField className={css.workingBase}>
							<IconBattery updatedAt={null} hardType={'full'} />
							Горячих:{' '}
							<span>
								{reportUser.active}
								{diffUser &&
									!!diffUser.activePercent &&
									NumberFormat(diffUser.activePercent, { sup: true, operator: true, after: '%' })}
							</span>
						</TextField>

						<TextField className={classNames(css.workingBase, css.workingBaseReverse)}>
							<IconBattery updatedAt={null} hardType={'medium'} />
							Теплых:{' '}
							<span>
								{reportUser.medium}
								{diffUser &&
									!!diffUser.mediumPercent &&
									NumberFormat(diffUser.mediumPercent, { sup: true, operator: true, after: '%' })}
							</span>
						</TextField>

						<TextField className={classNames(css.workingBase, css.workingBaseReverse)}>
							<IconBattery updatedAt={null} hardType={'low'} />
							Холодных:{' '}
							<span>
								{reportUser.low}
								{diffUser &&
									!!diffUser.lowPercent &&
									NumberFormat(diffUser.lowPercent, { sup: true, operator: true, after: '%' })}
							</span>
						</TextField>

						<TextField className={classNames(css.workingBase, css.workingBaseReverse)}>
							<IconBattery updatedAt={null} hardType={'empty'} />
							Забытых:{' '}
							<span>
								{reportUser.empty}
								{diffUser &&
									!!diffUser.emptyPercent &&
									NumberFormat(diffUser.emptyPercent, { sup: true, operator: true, after: '%' })}
							</span>
						</TextField>
					</ContentBlock>
				</Grid.Col>
			)}

			{!!reportParent?.total && reportParent?.total != reportUser?.total && (
				<Grid.Col span={spanCount}>
					<ContentBlock className={css.root}>
						<TextField className={css.workingBaseAll} size={'large'}>
							Организаций в команде:
							<span>
								{reportParent.total}
								{diffParent &&
									!!diffParent.totalPercent &&
									NumberFormat(diffParent.totalPercent, { sup: true, operator: true, after: '%' })}
							</span>
						</TextField>

						<TextField className={css.workingBase}>
							<IconBattery updatedAt={null} hardType={'full'} />
							Горячих:{' '}
							<span>
								{reportParent.active}
								{diffParent &&
									!!diffParent.activePercent &&
									NumberFormat(diffParent.activePercent, { sup: true, operator: true, after: '%' })}
							</span>
						</TextField>

						<TextField className={classNames(css.workingBase, css.workingBaseReverse)}>
							<IconBattery updatedAt={null} hardType={'medium'} />
							Теплых:{' '}
							<span>
								{reportParent.medium}
								{diffParent &&
									!!diffParent.mediumPercent &&
									NumberFormat(diffParent.mediumPercent, { sup: true, operator: true, after: '%' })}
							</span>
						</TextField>

						<TextField className={classNames(css.workingBase, css.workingBaseReverse)}>
							<IconBattery updatedAt={null} hardType={'low'} />
							Холодных:{' '}
							<span>
								{reportParent.low}
								{diffParent &&
									!!diffParent.lowPercent &&
									NumberFormat(diffParent.lowPercent, { sup: true, operator: true, after: '%' })}
							</span>
						</TextField>

						<TextField className={classNames(css.workingBase, css.workingBaseReverse)}>
							<IconBattery updatedAt={null} hardType={'empty'} />
							Забытых:{' '}
							<span>
								{reportParent.empty}
								{diffParent &&
									!!diffParent.emptyPercent &&
									NumberFormat(diffParent.emptyPercent, { sup: true, operator: true, after: '%' })}
							</span>
						</TextField>
					</ContentBlock>
				</Grid.Col>
			)}
		</>
	);
};
