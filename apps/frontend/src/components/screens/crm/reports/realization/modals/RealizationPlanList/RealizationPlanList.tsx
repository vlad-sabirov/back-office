import { FC, useContext, useEffect, useState } from 'react';
import { iData } from './interfaces/data';
import cn from 'classnames';
import { format, parse } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { customLocaleRu } from '@config/date-fns.locale';
import { Button, Icon, Menu, Modal, TextField } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { NumberFormat } from '@helpers/NumberFormat';
import { ReportRealizationResponse } from '@interfaces';
import { Tooltip } from '@mantine/core';
import { PercentColors } from '@screens/crm/reports/realization';
import { getPlanListData } from '@screens/crm/reports/realization/data';
import { RealizationPlanAdd, RealizationPlanEdit } from '..';
import { RealizationPlanListProps } from './props';
import css from './styles.module.scss';

export const RealizationPlanList: FC<RealizationPlanListProps> = observer(({ data }) => {
	const { modalStore } = useContext(MainContext);
	const [dataShow, setDataShow] = useState<iData[]>();
	const [planCurrent, setPlanCurrent] = useState<ReportRealizationResponse[]>([]);

	useEffect(() => {
		const dataResult: iData[] = [];
		data.forEach((item) => {
			if (!dataResult.some(({ date }) => date.year === item.year && date.month === item.month)) {
				dataResult.push({
					date: {
						year: item.year,
						month: item.month,
					},
					dateShow: format(parse(`${item.year}-${item.month}`, 'yyyy-MM', new Date()), 'LLLL yyyy', {
						locale: customLocaleRu,
					}),
					plan: item.plan,
					realization: item.realization,
					percent: 1,
				});
			} else {
				const findData = dataResult.findIndex(
					({ date }) => date.year === item.year && date.month === item.month
				);
				dataResult[findData].plan += item.plan;
				dataResult[findData].realization += item.realization;
			}
		});

		setDataShow(dataResult.map((item) => ({ ...item, percent: Math.round((item.realization / item.plan) * 100) })));
	}, [data]);

	const handleCloseModal = () => {
		modalStore.modalOpen('crmReportRealizationPlanList', false);
	};

	return (
		<>
			<Modal
				title="Планы продаж"
				opened={modalStore.modals.crmReportRealizationPlanList}
				onClose={handleCloseModal}
				size={520}
			>
				{dataShow && (
					<div className={css.wrapper}>
						{dataShow.map((item) => {
							const handleEdit = async () => {
								const response = await getPlanListData({
									date: {
										year: item.date.year,
										month: item.date.month,
									},
								});
								if (response) setPlanCurrent(response);
								modalStore.modalOpen('crmReportRealizationPlanEdit', true);
							};

							return (
								<Menu
									position="bottom"
									offset={-20}
									width={250}
									control={
										<div className={css.item}>
											<TextField className={css.date}>{item.dateShow}</TextField>

											<TextField className={css.plan}>
												{NumberFormat(item.plan)}
												{item.percent > 0 && (
													<span
														className={cn({
															[css.percent__red]: item.percent <= PercentColors.red,
															[css.percent__yellow]:
																item.percent > PercentColors.red &&
																item.percent <= PercentColors.yellow,
															[css.percent__green]: item.percent > PercentColors.yellow,
														})}
													>
														{item.percent}%
													</span>
												)}
											</TextField>
										</div>
									}
									key={`plan_${item.date.year}-${item.date.month}`}
								>
									<Menu.Label style={{ textTransform: 'capitalize' }}>{item.dateShow}</Menu.Label>
									{item.plan > 0 && (
										<Menu.Label size="small">План: {NumberFormat(item.plan)}</Menu.Label>
									)}
									{item.realization > 0 && (
										<Menu.Label size="small">
											Реализация: {NumberFormat(item.realization)}
										</Menu.Label>
									)}
									<Menu.Divider />
									<Menu.Item icon={<Icon name="edit" />} color="blue" onClick={handleEdit}>
										Изменить план
									</Menu.Item>
								</Menu>
							);
						})}
					</div>
				)}

				<Modal.Buttons>
					<Button onClick={handleCloseModal}>Отмена</Button>
					<Button
						color="primary"
						variant="hard"
						onClick={() => modalStore.modalOpen('crmReportRealizationPlanAdd', true)}
					>
						Добавить
					</Button>

					<Tooltip
						label={'Добавить план'}
						multiline
						withArrow
						openDelay={1000}
						transitionDuration={300}
						className={css.addTop}
					>
						<div>
							<Button
								color="primary"
								variant="hard"
								size="extraLarge"
								onClick={() => modalStore.modalOpen('crmReportRealizationPlanAdd', true)}
							>
								<Icon name="plus-large" />
							</Button>
						</div>
					</Tooltip>
				</Modal.Buttons>
			</Modal>

			<RealizationPlanAdd />
			<RealizationPlanEdit data={planCurrent} />
		</>
	);
});
