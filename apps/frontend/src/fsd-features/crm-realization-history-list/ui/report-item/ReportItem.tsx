import { FC, memo, useMemo } from 'react';
import { IReportProps } from './report-item.types';
import { format, parse } from 'date-fns';
import { customLocaleRu } from '@config/date-fns.locale';
import { TextField } from '@fsd/shared/ui-kit';
import { NumberFormat, NumberFormatAbbreviations } from '@helpers';
import css from '../_main/realization-list.module.scss';

export const ReportItem: FC<IReportProps> = memo((props) => {
	const { data, all, userId, parentId, withDiff, type, setCurrentReport, setIsShowWhatIf } = props;
	const dateFormatted = useMemo(
		() =>
			format(parse(`${data.year}-${data.month}`, 'yyyy-MM', new Date()), 'yyyy LLLL', { locale: customLocaleRu }),
		[data.year, data.month]
	);

	const currReport = useMemo(() => {
		return type === 'team'
			? all?.linkedList[`${data.year}-${data.month < 10 ? '0' : ''}${data.month}`]?.downToTeams.linkedList[
					parentId || userId
			  ]
			: all?.linkedList[`${data.year}-${data.month < 10 ? '0' : ''}${data.month}`]?.downToEmployees.linkedList[
					parentId || userId
			  ];
	}, [all?.linkedList, data.month, data.year, parentId, type, userId]);

	const diff = useMemo(() => {
		if (!currReport) {
			return null;
		}
		// eslint-disable-next-line
		return currReport.diff(currReport.prev as unknown as any);
	}, [currReport]);

	return (
		<div
			className={css.item}
			onClick={() => {
				setCurrentReport?.(data as any);
				setIsShowWhatIf?.(true);
			}}
		>
			<TextField className={css.date}>{dateFormatted}</TextField>

			<TextField className={css.realization}>
				{NumberFormat(data.realization, { round: true })}{' '}
				{!!diff?.realization &&
					withDiff &&
					NumberFormat(diff.realization, { round: true, sup: true, operator: true, after: '%' })}
			</TextField>

			<TextField className={css.plan}>
				{NumberFormatAbbreviations(data.plan ?? 0)}
				{!!diff?.plan &&
					withDiff &&
					NumberFormat(diff.plan, { round: true, sup: true, operator: true, after: '%' })}
			</TextField>

			<TextField className={css.averageOrderValue}>
				{NumberFormat(data.averageOrderValue, { round: true })}
				{!!diff?.averageOrderValue &&
					withDiff &&
					NumberFormat(diff.averageOrderValue, { round: true, sup: true, operator: true, after: '%' })}
			</TextField>

			<TextField className={css.depthOfSales}>
				{data.depthOfSales}
				{!!diff?.depthOfSales && withDiff && NumberFormat(diff.depthOfSales, { sup: true, operator: true })}
			</TextField>

			<TextField>
				{data.customerCount}
				{!!diff?.customerCount &&
					withDiff &&
					NumberFormat(diff.customerCount, { round: true, sup: true, operator: true, after: '%' })}
			</TextField>

			<TextField>
				{data.customerShipment}
				{!!diff?.customerShipment &&
					withDiff &&
					NumberFormat(diff.customerShipment, { round: true, sup: true, operator: true, after: '%' })}
			</TextField>
		</div>
	);
});
ReportItem.displayName = 'Report';
