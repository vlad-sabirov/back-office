import { FC, memo } from 'react';
import { IDetailReportProps } from './detail-report-year.types';
import { PercentChart } from './parts';
import cn from 'classnames';
import { TextField } from '@fsd/shared/ui-kit';
import { NumberFormat } from '@helpers';
import css from 'fsd-features/crm-realization-detail-report/ui/detail-report-year/detail-report-year.module.scss';

export const DetailReportYear: FC<IDetailReportProps> = memo((args) => {
	const {
		currentData,
		diffData,
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
		displayPercent = true,
	} = args;

	if (!currentData) {
		return null;
	}
	return (
		<div className={css.root}>
			<TextField size={'small'} mode={'heading'} className={css.title}>
				{title}
			</TextField>

			{displayRealization && (
				<TextField mode={'heading'} className={css.realization}>
					{currentData?.realization ? NumberFormat(Math.round(currentData.realization)) : 0}
					{diffData?.realization
						? NumberFormat(Math.round(diffData.realization), { sup: true, after: '%', operator: true })
						: ''}
					<span>
						{<>&nbsp;&nbsp;&nbsp;</>}
						{currentData?.plan ? NumberFormat(Math.round(currentData.plan)) : 0}
						{diffData?.plan
							? NumberFormat(Math.round(diffData.plan), { sup: true, after: '%', operator: true })
							: ''}
					</span>
				</TextField>
			)}

			{displayCustomerCount && (
				<TextField size={'small'} className={css.item}>
					Распределенных организаций:{' '}
					<span>{currentData?.customerCount ? NumberFormat(currentData.customerCount) : 0}</span>
					{!!diffData?.customerCount && withDiff && (
						<sup
							className={cn(css.sup, {
								[css.sup__positive]: diffData?.customerCount > 0,
								[css.sup__negative]: diffData?.customerCount < 0,
							})}
						>
							{diffData?.customerCount > 0 ? `+${diffData?.customerCount}` : diffData?.customerCount}%
						</sup>
					)}
				</TextField>
			)}

			{displayPercent && (
				<TextField size={'small'} className={css.item}>
					Процент выполнения плана:{' '}
					<span>{currentData?.percent ? NumberFormat(currentData.percent) : 0}%</span>
					{!!diffData?.percent && withDiff && (
						<sup
							className={cn(css.sup, {
								[css.sup__positive]: diffData?.customerCount < 0,
								[css.sup__negative]: diffData?.customerCount > 0,
							})}
						>
							{diffData?.percent > 0 ? `+${diffData?.percent}` : diffData?.percent}%
						</sup>
					)}
				</TextField>
			)}

			{displayCustomerShipments && (
				<TextField size={'small'} className={css.item}>
					Отгружено организаций:{' '}
					<span>{currentData?.customerShipment ? NumberFormat(currentData.customerShipment) : 0}</span>
					{!!diffData?.customerShipment && withDiff && (
						<sup
							className={cn(css.sup, {
								[css.sup__positive]: diffData?.customerShipment > 0,
								[css.sup__negative]: diffData?.customerShipment < 0,
							})}
						>
							{diffData?.customerShipment > 0
								? `+${diffData?.customerShipment}`
								: diffData?.customerShipment}
							%
						</sup>
					)}
				</TextField>
			)}

			{displayShipmentsCount && (
				<TextField size={'small'} className={css.item}>
					Всего отгрузок:{' '}
					<span>
						{currentData?.shipmentCount ? NumberFormat(currentData.shipmentCount) : 0} {withDiff}
					</span>
					{!!diffData?.shipmentCount && withDiff && (
						<sup
							className={cn(css.sup, {
								[css.sup__positive]: diffData?.shipmentCount > 0,
								[css.sup__negative]: diffData?.shipmentCount < 0,
							})}
						>
							{diffData?.shipmentCount > 0 ? `+${diffData?.shipmentCount}` : diffData?.shipmentCount}%
						</sup>
					)}
				</TextField>
			)}

			{displayWorkingBasePercent && (
				<TextField size={'small'} className={css.item}>
					Работа по организациям:{' '}
					<span>{currentData?.workingBasePercent ? NumberFormat(currentData.workingBasePercent) : 0}%</span>
					{!!diffData?.workingBasePercent && withDiff && (
						<sup
							className={cn(css.sup, {
								[css.sup__positive]: diffData?.workingBasePercent > 0,
								[css.sup__negative]: diffData?.workingBasePercent < 0,
							})}
						>
							{diffData?.workingBasePercent > 0
								? `+${diffData?.workingBasePercent}`
								: diffData?.workingBasePercent}
							%
						</sup>
					)}
				</TextField>
			)}

			{displayAverageOrderValue && (
				<TextField size={'small'} className={css.item}>
					Средний чек:{' '}
					<span>{currentData?.averageOrderValue ? NumberFormat(currentData.averageOrderValue) : 0}</span>
					{!!diffData?.averageOrderValue && withDiff && (
						<sup
							className={cn(css.sup, {
								[css.sup__positive]: diffData?.averageOrderValue > 0,
								[css.sup__negative]: diffData?.averageOrderValue < 0,
							})}
						>
							{diffData?.averageOrderValue > 0
								? `+${diffData?.averageOrderValue}`
								: diffData?.averageOrderValue}
							%
						</sup>
					)}
				</TextField>
			)}

			{displayDepthOfSales && (
				<TextField size={'small'} className={css.item}>
					Глубина продаж:{' '}
					<span>{currentData?.depthOfSales ? NumberFormat(currentData.depthOfSales) : 0}</span>
					{!!diffData?.depthOfSales && withDiff && (
						<sup
							className={cn(css.sup, {
								[css.sup__positive]: diffData?.depthOfSales > 0,
								[css.sup__negative]: diffData?.depthOfSales < 0,
							})}
						>
							{diffData?.depthOfSales > 0 ? `+${diffData?.depthOfSales}` : diffData?.depthOfSales}
						</sup>
					)}
				</TextField>
			)}

			{displayChart && <PercentChart data={currentData || null} />}
		</div>
	);
});
DetailReportYear.displayName = 'DetailReport';
