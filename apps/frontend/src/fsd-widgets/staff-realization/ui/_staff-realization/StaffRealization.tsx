import { FC, useEffect, useMemo, useState } from 'react';
import { format, parse } from 'date-fns';
import { useRouter } from 'next/router';
import { customLocaleRu } from '@config/date-fns.locale';
import {
	ICrmRealizationMonthResAll,
	ICrmRealizationMonthResTeam,
	useCrmRealizationGetDataMonthAll,
} from '@fsd/entities/crm-realization';
import { useAccess } from '@fsd/shared/lib/hooks';
import { Button, ContentBlock, Icon, TextField } from '@fsd/shared/ui-kit';
import { NumberFormat, NumberFormatAbbreviations } from '@helpers';
import { useUserDeprecated } from '@hooks';
import { Grid } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { ACCESS } from '../../config/access';
import { Modal } from '../modal/Modal';
import css from './staff-realization.module.scss';

export const StaffRealization: FC = () => {
	const { query } = useRouter();
	const { user, parent, rolesAlias } = useUserDeprecated(query.id ? Number(query.id) : undefined);
	const { userId, team, children } = useUserDeprecated();
	const [spanCount, setSpanCount] = useState<number>(25);
	const { width: screenWidth } = useViewportSize();
	const reportAll = useCrmRealizationGetDataMonthAll();
	const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
	const [modalType, setModalType] = useState<'team' | 'employee'>('team');
	const [realizationData, setRealizationData] = useState<
		Omit<ICrmRealizationMonthResAll, 'teams'>[] | Omit<ICrmRealizationMonthResTeam, 'employees'>[] | null
	>(null);

	const teamReports = useMemo(
		() =>
			reportAll
				?.getTeamByUserId(parent || user?.id || 0)
				?.reverse()
				.filter((report) => report.realization) ?? [],
		[parent, reportAll, user?.id]
	);

	const userReports = useMemo(
		() =>
			reportAll
				?.getEmployeeByUserId(user?.id ?? 0)
				?.reverse()
				.filter((report) => report.realization) ?? [],
		[reportAll, user?.id]
	);

	const isAdmin = useAccess({ access: ACCESS.REALIZATION });
	const isDisplayUser =
		(isAdmin || userId === Number(query?.id) || children?.includes(Number(query?.id))) &&
		userReports &&
		userReports.length > 0;
	const isDisplayTeam = (isAdmin || team?.includes(Number(query?.id))) && teamReports && teamReports.length > 0;

	const handleModalOpen = (
		data: Omit<ICrmRealizationMonthResAll, 'teams'>[] | Omit<ICrmRealizationMonthResTeam, 'employees'>[] | null,
		type: 'team' | 'employee'
	) => {
		if (!data) {
			return;
		}
		setRealizationData(data);
		setModalType(type);
		setModalIsOpen(true);
	};

	useEffect(() => {
		if (screenWidth >= 100 && screenWidth <= 1500) setSpanCount(100);
		if (screenWidth >= 1500 && screenWidth <= 1600) setSpanCount(85);
		if (screenWidth >= 1600 && screenWidth <= 1700) setSpanCount(80);
		if (screenWidth >= 1700 && screenWidth <= 1800) setSpanCount(75);
		if (screenWidth >= 1800 && screenWidth <= 1900) setSpanCount(70);
		if (screenWidth >= 1900 && screenWidth <= 2000) setSpanCount(65);
		if (screenWidth >= 2000 && screenWidth <= 2200) setSpanCount(60);
		if (screenWidth >= 2200 && screenWidth <= 2350) setSpanCount(55);
		if (screenWidth >= 2350 && screenWidth <= 2600) setSpanCount(50);
		if (screenWidth >= 2600 && screenWidth <= 2800) setSpanCount(45);
		if (screenWidth >= 2800 && screenWidth <= 3600) setSpanCount(40);
	}, [screenWidth]);

	if (!user || !rolesAlias?.includes('crm')) {
		return null;
	}

	return (
		<>
			{isDisplayUser && (
				<Grid.Col span={spanCount}>
					<ContentBlock className={css.root}>
						<Button className={css.open} onClick={() => handleModalOpen(userReports, 'employee')}>
							<Icon name={'open'} />
						</Button>

						<TextField mode={'heading'} size={'small'}>
							Реализация сотрудника за последние 6 месяцев
						</TextField>

						<div className={css.tableHead}>
							<TextField>Дата</TextField>
							<TextField>Реализация</TextField>
							<TextField>План</TextField>
							<TextField>Средний чек</TextField>
							<TextField>В базе</TextField>
						</div>

						{userReports
							.filter((_, i) => i < 6)
							.map((report) => {
								const linkedListReport =
									reportAll?.linkedList?.[
										`${report.year}-${report.month <= 9 ? '0' : ''}${report.month}`
									]?.downToEmployees?.linkedList?.[user.id];
								const diff = linkedListReport?.diff(linkedListReport?.prev) || null;
								const date = format(
									parse(`${report.year}-${report.month}`, 'yyyy-MM', new Date()),
									'yyyy LLLL',
									{
										locale: customLocaleRu,
									}
								);

								return (
									<div
										className={css.tableBody}
										key={`${report.year}-${report.month <= 9 ? '0' : ''}${report.month}`}
									>
										<TextField className={css.date}>{date}</TextField>

										<TextField className={css.realization}>
											{NumberFormat(report.realization, { round: true })}
											{!!diff?.realization &&
												NumberFormat(diff.realization, {
													sup: true,
													operator: true,
													after: '%',
												})}
										</TextField>

										<TextField className={css.plan}>
											{NumberFormat(report.plan, { round: true })}
											{!!diff?.plan &&
												NumberFormat(diff.plan, { sup: true, operator: true, after: '%' })}
										</TextField>

										<TextField>
											{NumberFormat(report.averageOrderValue, { round: true })}
											{!!diff?.averageOrderValue &&
												NumberFormat(diff.averageOrderValue, {
													sup: true,
													operator: true,
													after: '%',
												})}
										</TextField>

										<TextField>
											{NumberFormat(report.customerCount, { round: true })}
											{!!diff?.customerCount &&
												NumberFormat(diff.customerCount, {
													sup: true,
													operator: true,
													after: '%',
												})}
										</TextField>
									</div>
								);
							})}
					</ContentBlock>
				</Grid.Col>
			)}

			{isDisplayTeam && (
				<Grid.Col span={spanCount}>
					<ContentBlock className={css.root}>
						<Button className={css.open} onClick={() => handleModalOpen(teamReports, 'team')}>
							<Icon name={'open'} />
						</Button>

						<TextField mode={'heading'} size={'small'}>
							Реализация команды за последние 6 месяцев
						</TextField>

						<div className={css.tableHead}>
							<TextField>Дата</TextField>
							<TextField>Реализация</TextField>
							<TextField>План</TextField>
							<TextField>Средний чек</TextField>
							<TextField>В базе</TextField>
							<TextField>Отгруз.</TextField>
						</div>

						{teamReports
							.filter((_, i) => i < 6)
							.map((report) => {
								const linkedListReport =
									reportAll?.linkedList?.[
										`${report.year}-${report.month <= 9 ? '0' : ''}${report.month}`
									]?.downToTeams?.linkedList?.[parent || user.id];
								const diff = linkedListReport?.diff(linkedListReport?.prev) || null;
								const date = format(
									parse(`${report.year}-${report.month}`, 'yyyy-MM', new Date()),
									'yyyy LLLL',
									{
										locale: customLocaleRu,
									}
								);

								return (
									<div
										className={css.tableBody}
										key={`${report.year}-${report.month <= 9 ? '0' : ''}${report.month}`}
									>
										<TextField className={css.date}>{date}</TextField>

										<TextField className={css.realization}>
											{NumberFormat(report.realization, { round: true })}
											{!!diff?.realization &&
												NumberFormat(diff.realization, {
													sup: true,
													operator: true,
													after: '%',
												})}
										</TextField>

										<TextField className={css.plan}>
											{NumberFormatAbbreviations(report.plan ?? 0)}
											{!!diff?.plan &&
												NumberFormat(diff.plan, { sup: true, operator: true, after: '%' })}
										</TextField>

										<TextField>
											{NumberFormat(report.averageOrderValue, { round: true })}
											{!!diff?.averageOrderValue &&
												NumberFormat(diff.averageOrderValue, {
													sup: true,
													operator: true,
													after: '%',
												})}
										</TextField>

										<TextField>
											{NumberFormat(report.customerCount, { round: true })}
											{!!diff?.customerCount &&
												NumberFormat(diff.customerCount, {
													sup: true,
													operator: true,
													after: '%',
												})}
										</TextField>

										<TextField>
											{NumberFormat(report.customerShipment, { round: true })}
											{!!diff?.customerShipment &&
												NumberFormat(diff.customerShipment, {
													sup: true,
													operator: true,
													after: '%',
												})}
										</TextField>
									</div>
								);
							})}
					</ContentBlock>
				</Grid.Col>
			)}

			<Modal
				isOpen={modalIsOpen}
				setIsOpen={setModalIsOpen}
				data={realizationData}
				type={modalType}
				userId={user.id}
				parentId={parent || 0}
			/>
		</>
	);
};
