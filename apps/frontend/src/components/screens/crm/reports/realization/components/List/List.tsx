import { FC, useContext, useState } from 'react';
import cn from 'classnames';
import { observer } from 'mobx-react-lite';
import { Avatar, Icon, Menu, Progress, Table, TextField } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { NumberFormat } from '@helpers/NumberFormat';
import { useAccess } from '@hooks';
import { ReportRealizationResponse } from '@interfaces';
import { TablePropsData } from '@fsd/shared/ui-kit/table/Table.props';
import { FilterPeriodType, PercentColors, RealizationAccess, RealizationEdit, ReportRealizationContext } from '../..';
import { RealizationCurrent } from '../../modals/RealizationCurrent';
import { ListProps } from './props';
import css from './styles.module.scss';
import { MenuItemStaffUser } from '@fsd/shared/ui-kit/menu/items';
import { useStateSelector } from '@fsd/shared/lib/hooks';

export const List: FC<ListProps> = observer(({ data, oldData, displayType = FilterPeriodType.Month }) => {
	const { modalStore } = useContext(MainContext);
	const { realizationStore } = useContext(ReportRealizationContext);
	const team = useStateSelector((state) => state.app.auth.team);
	const CheckAccess = useAccess();

	const [realizationCurrentOpen, setRealizationCurrentOpen] = useState<boolean>(false);
	const [realizationCurrent, setRealizationCurrent] = useState<ReportRealizationResponse | null>(null);
	const [realizationOld, setRealizationOld] = useState<ReportRealizationResponse[] | null>(null);

	const tableData = {
		header: [
			{ key: 'user', label: 'Сотрудник' },
			{ key: 'customerNew', label: 'Новых клиентов' },
			{ key: 'customerShipment', label: 'Отгружено организаций' },
			{ key: 'realization', label: 'Реализация' },
		],
		sortKeys: ['realization', 'user', 'customerNew', 'customerShipment'],
		sortDefault: 'desc',

		body:
			data && data.length
				? data
						.filter((report) => report.userId !== 9)
						.map((report) => {
							const isJanna = report?.user?.firstName === 'Жанна' && report.user.lastName === 'Соколова';

							// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
							const user = report.user!;
							const shipmentPercent = Math.round(
								report.customerShipment && report.customerCount
									? (report.customerShipment / report.customerCount) * 100
									: 0
							);
							const realizationPercent = Math.round(
								report.plan && report.realization ? (report.realization / report.plan) * 100 : 0
							);
							const isDisplayCalc = (
								team?.some((userId) => userId == report.userId || 0)
								|| CheckAccess(RealizationAccess.calculate)
							);

							return {
								user: {
									output: (
										<>
											{isJanna ? (
												<TextField className={css.userName}>Уволенные сотрудники</TextField>
											) : (
												<Menu
													key={`departmentUserId` + user.id}
													offset={-20}
													width={250}
													control={
														<div className={css.user}>
															<Avatar
																color={user.color}
																text={`${user.lastName[0]}${user.firstName[0]}`}
																src={user.photo}
																size="small"
																className={css.userPhoto}
															/>

															<TextField className={css.userName}>
																{user.lastName} {user.firstName}
															</TextField>
														</div>
													}
												>
													<MenuItemStaffUser data={user} />

													{realizationStore.sortType === FilterPeriodType.Month &&
														CheckAccess(RealizationAccess.calculate) &&
														CheckAccess(RealizationAccess.editRealization) && (
															<Menu.Divider />
														)}

													{realizationStore.sortType === FilterPeriodType.Month &&
														(CheckAccess(RealizationAccess.calculate) ||
															// eslint-disable-next-line max-len
															// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
															team?.some((userId) => userId == report.userId || 0)) && (
															<>
																<Menu.Item
																	icon={<Icon name="information" />}
																	onClick={async () => {
																		setRealizationCurrent(report);
																		setRealizationOld(
																			oldData?.filter(
																				(findReport) =>
																					findReport.userId === report.userId
																			) || null
																		);
																		setRealizationCurrentOpen(true);
																	}}
																>
																	Подробнее
																</Menu.Item>
															</>
														)}

													{realizationStore.sortType === FilterPeriodType.Month &&
														CheckAccess(RealizationAccess.editRealization) &&
														!!report.realization &&
														report.realization > 0 && (
															<>
																<Menu.Item
																	color="blue"
																	icon={<Icon name="edit" />}
																	onClick={() => {
																		setRealizationCurrent(report);
																		modalStore.modalOpen(
																			'crmReportRealizationEdit',
																			true
																		);
																	}}
																>
																	Изменить реализацию
																</Menu.Item>
															</>
														)}
												</Menu>
											)}
										</>
									),
									index: `${user.lastName} ${user.firstName}`,
								},

								customerShipment: {
									output: (
										<>
											{displayType !== FilterPeriodType.Month ||
											isJanna ||
											!report.realization ? (
												''
											) : (
												<Progress
													value={shipmentPercent}
													size={'extraSmall'}
													label={
														isDisplayCalc ? (
															<>
																{report.customerShipment} из {report.customerCount}{' '}
																<span>{shipmentPercent}%</span>
															</>
														) : undefined
													}
													className={cn(css.customerShipment, {
														[css.customerShipment__disabled]: !isDisplayCalc,
													})}
												/>
											)}
										</>
									),
									index:
										displayType !== FilterPeriodType.Month || isJanna || !report.realization
											? report.customerShipment
											: 0,
								},

								realization: {
									output: (
										<>
											{!report.realization ? (
												<TextField className={css.plan} size="small">
													{isDisplayCalc && `План: ${NumberFormat(report.plan)}`}
												</TextField>
											) : (
												<Progress
													value={realizationPercent}
													size={'extraSmall'}
													color={
														realizationPercent < PercentColors.red
															? 'red'
															: realizationPercent < PercentColors.yellow
															? 'yellow'
															: 'green'
													}
													label={
														isDisplayCalc ? (
															<>
																{/* eslint-disable-next-line max-len */}
																Реализация: {NumberFormat(
																	report.realization as number
																)}{' '}
																<span>{realizationPercent}%</span>
															</>
														) : undefined
													}
													className={cn(css.realization, {
														[css.realization__disabled]: !isDisplayCalc,
													})}
												/>
											)}
										</>
									),
									index: report.realization,
								},
							};
						})
				: [],
	};

	return (
		<div>
			<Table data={tableData as TablePropsData} />

			<RealizationCurrent
				current={realizationCurrent}
				old={realizationOld?.[0] || null}
				open={realizationCurrentOpen}
				setOpen={setRealizationCurrentOpen}
			/>

			<RealizationEdit data={realizationCurrent} />
		</div>
	);
});
