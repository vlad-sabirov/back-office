import { FC, useCallback, useEffect, useState } from 'react';
import { ITableSortOder } from './interfaces/SortOrder';
import cn from 'classnames';
import { Icon, TablePropsBodyObject, TablePropsBodySettings } from '@fsd/shared/ui-kit';
import { TableProps, TablePropsBody } from './Table.props';
import css from './Styles.layout.module.scss';

function sortData({ tableData, sortKey, reverse }: { tableData: TablePropsBody[]; sortKey: string; reverse: boolean }) {
	if (!sortKey || sortKey === 'tr_settings') {
		return tableData;
	}
	const sortedData = tableData
		? tableData.sort((a, b) => {
				const aIndex = a[sortKey] as TablePropsBodyObject;
				const bIndex = b[sortKey] as TablePropsBodyObject;
				return aIndex.index > bIndex.index ? 1 : -1;
		  })
		: [];
	if (reverse) return sortedData.reverse();
	return sortedData;
}

const Table: FC<TableProps> = ({ data, className, ...props }) => {
	const classNames = cn({ [css.table]: true }, className);
	const [sortKey, setSortKey] = useState<string>('');
	const [sortOrder, setSortOrder] = useState<ITableSortOder>('asc');

	useEffect(() => {
		if (data && data.sortDefault) setSortOrder(data.sortDefault);
		if (data && data.sortKeys) setSortKey(data.sortKeys[0]);
	}, [data]);

	const sortedData = useCallback(() => {
		return sortData({ tableData: data?.body as TablePropsBody[], sortKey, reverse: sortOrder === 'desc' });
	}, [data, sortKey, sortOrder]);

	function changeSort(key: string) {
		setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		setSortKey(key);
	}

	if (!data || !data.body || !data.body.length) return null;

	return (
		<table
			className={classNames}
			style={{
				position: 'relative',
				width: '100%',
			}}
			{...props}
		>
			{data?.header
				? data.header.length > 0 && (
						<thead className={css.header}>
							<tr>
								{data.header.map((element, index) => (
									<th
										key={'tableHeadIndex' + index}
										style={{
											width: element.width,
											maxWidth: element.width,
										}}
										className={cn({
											[css.headSortable]: data.sortKeys && data.sortKeys.includes(element.key),
											[css.headSortActive]: element.key === sortKey,
										})}
										onClick={() => {
											if (data.sortKeys && data.sortKeys.includes(element.key)) {
												changeSort(element.key);
											}
										}}
									>
										<div>
											{data.sortKeys && data.sortKeys.includes(element.key) ? (
												<Icon
													name={element.key === sortKey ? 'arrow-large' : 'arrow-two-small'}
													className={cn({
														[css.sortIcon]: true,
														[css.sortIconReverse]:
															element.key === sortKey && sortOrder === 'desc',
													})}
												/>
											) : null}
											{element.label}
										</div>
									</th>
								))}
							</tr>
						</thead>
				  )
				: null}

			{data?.body && data.body.length > 0 ? (
				<tbody
					className={css.body}
					style={{
						position: 'relative',
						width: '100%',
					}}
				>
					{sortedData().map((row, rowIndex) => {
						const settings = row.tr_settings as TablePropsBodySettings;
						const ntd = rowIndex % 2 ? '1' : '2';
						return (
							<tr
								key={`tableRowIndex` + rowIndex}
								style={{
									position: 'relative',
									width: '100%',
								}}
								className={cn(css['color__tr' + (rowIndex % 2 ? '1' : '2')], {
									[css['color__red' + ntd]]: settings?.color == 'red',
									[css['color__yellow' + ntd]]: settings?.color == 'yellow',
									[css['color__green' + ntd]]: settings?.color == 'green',
									[css['color__purple' + ntd]]: settings?.color == 'purple',
								})}
							>
								{data.header.map((header, headerIndex) => {
									return (
										<td
											key={`tableColIndex_${rowIndex}_${headerIndex}`}
											style={{
												verticalAlign: header.verticalAlign,
												width: header.width,
												maxWidth: header.width,
											}}
										>
											{/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
											{/*// @ts-ignore*/}
											{row[header.key].output}
										</td>
									);
								})}
							</tr>
						);
					})}
				</tbody>
			) : null}
		</table>
	);
};

export { Table };
