import { FC, memo, useMemo } from 'react';
import { IDetailReportProps } from './detail-report-month.types';
import { PercentChart } from './parts';
import cn from 'classnames';
import { format, parse } from 'date-fns';
import { customLocaleRu } from '@config/date-fns.locale';
import { CrmOrganizationConst } from '@fsd/entities/crm-organization';
import { CRM_REALIZATION_COLORS } from '@fsd/entities/crm-realization';
import { useAccess } from '@fsd/shared/lib/hooks';
import { Progress, TextField } from '@fsd/shared/ui-kit';
import { NumberFormat } from '@helpers';
import { Tooltip } from '@mantine/core';
import css from 'fsd-features/crm-realization-detail-report/ui/detail-report-month/detail-report-month.module.scss';

export const DetailReportMonth: FC<IDetailReportProps> = memo((args) => {
	const {
		data,
		title,
		displayChart = true,
		withDiff,
		displayRealization = true,
		displayCustomerCount = true,
		displayCustomerShipments = true,
		displayShipmentsCount = true,
		displayDepthOfSales = true,
		displayAverageOrderValue = true,
		displayWorkingBasePercent = true,
	} = args;

	const isCrmAdmin = useAccess({ access: CrmOrganizationConst.Access.Admin });

	const dataCurrent = data?.data;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const dataDiff = data?.diff(data?.prev as unknown as any) ?? null;
	const date = useMemo(() => {
		if (!dataCurrent?.year || !dataCurrent.month) {
			return 'период';
		}
		return format(parse(`${dataCurrent.year}-${dataCurrent.month}`, 'yyyy-MM', new Date()), 'LLLL', {
			locale: customLocaleRu,
		});
	}, [dataCurrent?.month, dataCurrent?.year]);

	const workingBasePlan = useMemo(() => {
		if (!dataCurrent?.planWorkingBasePercent || !dataCurrent?.workingBasePercent) {
			return 0;
		}
		return (dataCurrent.workingBasePercent / dataCurrent.planWorkingBasePercent) * 100;
	}, [dataCurrent?.planWorkingBasePercent, dataCurrent?.workingBasePercent]);

	const customerCountPlan = useMemo(() => {
		if (!dataCurrent?.planCustomerCount || !dataCurrent?.customerCount) {
			return 0;
		}
		return (dataCurrent.customerCount / dataCurrent.planCustomerCount) * 100;
	}, [dataCurrent?.planCustomerCount, dataCurrent?.customerCount]);

	const chartMargin = useMemo<number>(() => {
		let margin = 0;
		if (isCrmAdmin) {
			return margin;
		}

		if (dataCurrent?.planCustomerCount) {
			margin += 12;
		}

		if (dataCurrent?.planWorkingBasePercent) {
			margin += 12;
		}
		return margin;
	}, [isCrmAdmin, dataCurrent]);

	if (!dataCurrent) {
		return null;
	}
	return (
		<div className={css.root}>
			<TextField size={'small'} mode={'heading'} className={css.title}>
				{title ?? `Реализация за ${date}`}
			</TextField>

			{displayRealization && (
				<TextField mode={'heading'} className={css.realization}>
					{dataCurrent.realization ? NumberFormat(Math.round(dataCurrent.realization)) : 0}
					<span> / {dataCurrent.plan ? NumberFormat(Math.round(dataCurrent.plan)) : 0}</span>
				</TextField>
			)}

			{displayCustomerCount && (
				<TextField size={'small'} className={css.item}>
					Распределенных организаций: <span>{NumberFormat(dataCurrent.customerCount) ?? 0}</span>
					{!!dataDiff?.customerCount && withDiff && (
						<sup
							className={cn(css.sup, {
								[css.sup__positive]: dataDiff?.customerCount > 0,
								[css.sup__negative]: dataDiff?.customerCount < 0,
							})}
						>
							{dataDiff?.customerCount > 0 ? `+${dataDiff?.customerCount}` : dataDiff?.customerCount}%
						</sup>
					)}
				</TextField>
			)}

			{displayCustomerShipments && (
				<TextField size={'small'} className={css.item}>
					Отгружено организаций: <span>{NumberFormat(dataCurrent.customerShipment) ?? 0}</span>
					{!!dataDiff?.customerShipment && withDiff && (
						<sup
							className={cn(css.sup, {
								[css.sup__positive]: dataDiff?.customerShipment > 0,
								[css.sup__negative]: dataDiff?.customerShipment < 0,
							})}
						>
							{dataDiff?.customerShipment > 0
								? `+${dataDiff?.customerShipment}`
								: dataDiff?.customerShipment}
							%
						</sup>
					)}
				</TextField>
			)}

			{displayShipmentsCount && (
				<TextField size={'small'} className={css.item}>
					Всего отгрузок:{' '}
					<span>
						{NumberFormat(dataCurrent.shipmentCount) ?? 0} {withDiff}
					</span>
					{!!dataDiff?.shipmentCount && withDiff && (
						<sup
							className={cn(css.sup, {
								[css.sup__positive]: dataDiff?.shipmentCount > 0,
								[css.sup__negative]: dataDiff?.shipmentCount < 0,
							})}
						>
							{dataDiff?.shipmentCount > 0 ? `+${dataDiff?.shipmentCount}` : dataDiff?.shipmentCount}%
						</sup>
					)}
				</TextField>
			)}

			{displayWorkingBasePercent && (
				<TextField size={'small'} className={css.item}>
					Работа по организациям: <span>{NumberFormat(dataCurrent.workingBasePercent) ?? 0}%</span>
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
			)}

			{displayAverageOrderValue && (
				<TextField size={'small'} className={css.item}>
					Средний чек: <span>{NumberFormat(dataCurrent.averageOrderValue)}</span>
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
				</TextField>
			)}

			{displayDepthOfSales && (
				<TextField size={'small'} className={css.item}>
					Глубина продаж: <span>{NumberFormat(dataCurrent.depthOfSales) ?? 0}</span>
					{!!dataDiff?.depthOfSales && withDiff && (
						<sup
							className={cn(css.sup, {
								[css.sup__positive]: dataDiff?.depthOfSales > 0,
								[css.sup__negative]: dataDiff?.depthOfSales < 0,
							})}
						>
							{dataDiff?.depthOfSales > 0 ? `+${dataDiff?.depthOfSales}` : dataDiff?.depthOfSales}
						</sup>
					)}
				</TextField>
			)}

			{dataCurrent.planWorkingBasePercent && !isCrmAdmin ? (
				<Tooltip
					label={`План активной базы: ${dataCurrent.planWorkingBasePercent ?? 0}%. Сейчас: ${
						dataCurrent.workingBasePercent ?? 0
					}%`}
					withArrow
					multiline
					w={200}
					position="left"
					offset={-10}
				>
					<div
						className={css.workingBasePlan}
						style={{ marginBottom: dataCurrent.planCustomerCount ? 12 : 0 }}
					>
						<Progress
							value={workingBasePlan ?? 0}
							size={'extraSmall'}
							color={
								workingBasePlan && workingBasePlan < CRM_REALIZATION_COLORS.RED
									? 'red'
									: workingBasePlan &&
									  workingBasePlan >= CRM_REALIZATION_COLORS.RED &&
									  workingBasePlan < CRM_REALIZATION_COLORS.YELLOW
									? 'yellow'
									: 'green'
							}
						/>
					</div>
				</Tooltip>
			) : (
				''
			)}

			{dataCurrent.planCustomerCount && !isCrmAdmin ? (
				<Tooltip
					label={`План базы: ${dataCurrent.planCustomerCount ?? 0}. Сейчас: ${
						dataCurrent.customerCount ?? 0
					}`}
					withArrow
					multiline
					w={220}
					position="right"
					offset={-10}
				>
					<div className={css.newOrganizationPlan}>
						<Progress
							value={customerCountPlan ?? 0}
							size={'extraSmall'}
							color={
								customerCountPlan && customerCountPlan < CRM_REALIZATION_COLORS.RED
									? 'red'
									: customerCountPlan &&
									  customerCountPlan >= CRM_REALIZATION_COLORS.RED &&
									  customerCountPlan < CRM_REALIZATION_COLORS.YELLOW
									? 'yellow'
									: 'green'
							}
						/>
					</div>
				</Tooltip>
			) : (
				''
			)}

			<div className={css.percentChart} style={{ marginBottom: chartMargin }}>
				{displayChart && <PercentChart data={data} />}
			</div>
		</div>
	);
});
DetailReportMonth.displayName = 'DetailReport';
