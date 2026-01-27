import { FC, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { format, parse, parseISO, subMonths } from 'date-fns';
import { useRouter } from 'next/router';
import { customLocaleRu } from '@config/date-fns.locale';
import { IconBattery } from '@fsd/entities/crm-organization/ui/icon-battery/IconBattery';
import { ICrmWorkingBaseUserRes, useCrmWorkingDiff } from '@fsd/entities/crm-working-base';
import { useAccess, useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, ContentBlock, Icon, TextField } from '@fsd/shared/ui-kit';
import { NumberFormat } from '@helpers';
import { useUserDeprecated } from '@hooks';
import { Grid } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { ACCESS } from '../../config/access';
import { Modal } from '../modal/Modal';
import css from './staff-working-base.module.scss';

export const StaffWorkingBase: FC = () => {
	const { query } = useRouter();
	const { user, parent } = useUserDeprecated(query.id ? Number(query.id) : undefined);
	const { userId, team, children } = useUserDeprecated();
	const [spanCount, setSpanCount] = useState<number>(25);
	const { width: screenWidth } = useViewportSize();
	const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
	const [modalType, setModalType] = useState<'team' | 'employee'>('team');

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

	// Team
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

	const isAdmin = useAccess({ access: ACCESS.REALIZATION });
	const isDisplayUser =
		(isAdmin || userId === Number(query?.id) || children?.includes(Number(query?.id))) && !!reportUser?.total;
	const isDisplayTeam =
		(isAdmin || team?.includes(Number(query?.id))) &&
		!!reportParent?.total &&
		reportParent.total !== reportUser?.total;

	const handleModalOpen = (type: 'team' | 'employee') => {
		setModalType(type);
		setModalIsOpen(true);
	};

	useEffect(() => {
		if (screenWidth >= 100 && screenWidth <= 1250) setSpanCount(100);
		if (screenWidth >= 1250 && screenWidth <= 1350) setSpanCount(65);
		if (screenWidth >= 1350 && screenWidth <= 1400) setSpanCount(60);
		if (screenWidth >= 1400 && screenWidth <= 1450) setSpanCount(55);
		if (screenWidth >= 1450 && screenWidth <= 1550) setSpanCount(50);
		if (screenWidth >= 1550 && screenWidth <= 1650) setSpanCount(45);
		if (screenWidth >= 1650 && screenWidth <= 1800) setSpanCount(40);
		if (screenWidth >= 1800 && screenWidth <= 1950) setSpanCount(35);
		if (screenWidth >= 1950 && screenWidth <= 2200) setSpanCount(30);
		if (screenWidth >= 2200 && screenWidth <= 2400) setSpanCount(25);
		if (screenWidth >= 2400 && screenWidth <= 2550) setSpanCount(25);
		if (screenWidth >= 2550 && screenWidth <= 2900) setSpanCount(20);
		if (screenWidth >= 2900 && screenWidth <= 3300) setSpanCount(17);
		if (screenWidth >= 3300 && screenWidth <= 3600) setSpanCount(15);
	}, [screenWidth]);

	return (
		<>
			{isDisplayUser && (
				<Grid.Col span={spanCount}>
					<ContentBlock className={css.root}>
						<Button className={css.open} onClick={() => handleModalOpen('employee')}>
							<Icon name={'open'} />
						</Button>

						<TextField mode={'heading'} size={'small'}>
							Работа базы сотрудника
						</TextField>

						<TextField className={css.workingBaseAll} size={'large'}>
							Всего организаций:
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
							Теплых:
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

						{!!reportLast?.updatedAt && (
							<TextField className={css.footer} size={'small'}>
								Последнее обновление{' '}
								{format(parseISO(reportLast.updatedAt), 'd MMMM yyyy, HH:mm', {
									locale: customLocaleRu,
								})}
							</TextField>
						)}
					</ContentBlock>
				</Grid.Col>
			)}

			{isDisplayTeam && (
				<Grid.Col span={spanCount}>
					<ContentBlock className={css.root}>
						<Button className={css.open} onClick={() => handleModalOpen('team')}>
							<Icon name={'open'} />
						</Button>

						<TextField mode={'heading'} size={'small'}>
							Работа базы команды
						</TextField>

						<TextField className={css.workingBaseAll} size={'large'}>
							Всего организаций:
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

						{!!reportLast?.updatedAt && (
							<TextField className={css.footer} size={'small'}>
								Последнее обновление{' '}
								{format(parseISO(reportLast.updatedAt), 'd MMMM yyyy, HH:mm', {
									locale: customLocaleRu,
								})}
							</TextField>
						)}
					</ContentBlock>
				</Grid.Col>
			)}

			<Modal
				isOpen={modalIsOpen}
				setIsOpen={setModalIsOpen}
				type={modalType}
				userId={user?.id || null}
				teamIds={teamIds || null}
			/>
		</>
	);
};
