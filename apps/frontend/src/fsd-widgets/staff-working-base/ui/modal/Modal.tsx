import { FC, useMemo } from 'react';
import { IModalProps } from './modal.types';
import { format, parse } from 'date-fns';
import { customLocaleRu } from '@config/date-fns.locale';
import { IconBattery } from '@fsd/entities/crm-organization/ui/icon-battery/IconBattery';
import { crmWorkingDiff } from '@fsd/entities/crm-working-base';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { TextField, Modal as UIModal } from '@fsd/shared/ui-kit';
import { NumberFormat } from '@helpers';
import css from './modal.module.scss';

export const Modal: FC<IModalProps> = (props) => {
	const { teamIds, userId, type, isOpen, setIsOpen } = props;
	const reportsAll = useStateSelector((state) => state.crm_working_base.data.all);

	const reportData = useMemo(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const data = Object.entries(reportsAll).reduce((acc: any[], [_, item]) => {
			const val = {
				year: item.year,
				month: item.month,
				low: 0,
				medium: 0,
				active: 0,
				total: 0,
				empty: 0,
			};

			if (type === 'employee' && userId) {
				const foundValue = item.users?.find((report) => report.userId === userId);
				if (foundValue) {
					val.total += foundValue.total;
					val.active += foundValue.active;
					val.medium += foundValue.medium;
					val.low += foundValue.low;
					val.empty += foundValue.empty;
				}
			}

			if (type === 'team' && userId) {
				const foundValue = item.users?.filter((report) => teamIds?.includes(report.userId)) ?? [];
				for (const value of foundValue) {
					val.total += value.total;
					val.active += value.active;
					val.medium += value.medium;
					val.low += value.low;
					val.empty += value.empty;
				}
			}

			if (val.total !== 0) {
				acc.push(val);
			}

			return acc;
		}, []);
		return data.reverse();
	}, [reportsAll, teamIds, type, userId]);

	const handleModalClose = () => {
		setIsOpen(false);
	};

	return (
		<UIModal
			title={`Работа ${type === 'team' ? 'команды' : 'сотрудника'} с базой`}
			size={760}
			opened={isOpen}
			onClose={handleModalClose}
		>
			<div className={css.tableHead}>
				<TextField>Дата</TextField>
				<TextField>Всего</TextField>
				<TextField>
					<IconBattery hardType={'full'} updatedAt={''} />
				</TextField>
				<TextField>
					<IconBattery hardType={'medium'} updatedAt={''} />
				</TextField>
				<TextField>
					<IconBattery hardType={'low'} updatedAt={''} />
				</TextField>
				<TextField>
					<IconBattery hardType={'empty'} updatedAt={''} />
				</TextField>
			</div>

			{reportData.map((report, i) => {
				const date = format(parse(`${report.year}-${report.month}`, 'yyyy-MM', new Date()), 'yyyy LLLL', {
					locale: customLocaleRu,
				});

				const prevReport = reportData[i + 1];
				const diff = prevReport?.total
					? crmWorkingDiff(report, prevReport) || {
							total: 0,
							totalPercent: 0,
							active: 0,
							activePercent: 0,
							medium: 0,
							mediumPercent: 0,
							low: 0,
							lowPercent: 0,
							empty: 0,
							emptyPercent: 0,
					  }
					: {
							total: 0,
							totalPercent: 0,
							active: 0,
							activePercent: 0,
							medium: 0,
							mediumPercent: 0,
							low: 0,
							lowPercent: 0,
							empty: 0,
							emptyPercent: 0,
					  };

				return (
					<div key={`${report.year}-${report.month}`} className={css.tableBody}>
						<TextField className={css.date}>{date}</TextField>

						<TextField>
							{report.total}
							{diff &&
								!!diff.totalPercent &&
								NumberFormat(diff.totalPercent, { sup: true, operator: true, after: '%' })}
						</TextField>

						<TextField>
							{report.active}
							{diff &&
								!!diff.activePercent &&
								NumberFormat(diff.activePercent, { sup: true, operator: true, after: '%' })}
						</TextField>

						<TextField className={css.workingBaseReverse}>
							{report.medium}
							{diff &&
								!!diff.mediumPercent &&
								NumberFormat(diff.mediumPercent, { sup: true, operator: true, after: '%' })}
						</TextField>

						<TextField className={css.workingBaseReverse}>
							{report.low}
							{diff &&
								!!diff.lowPercent &&
								NumberFormat(diff.lowPercent, { sup: true, operator: true, after: '%' })}
						</TextField>

						<TextField className={css.workingBaseReverse}>
							{report.empty}
							{diff &&
								!!diff.emptyPercent &&
								NumberFormat(diff.emptyPercent, { sup: true, operator: true, after: '%' })}
						</TextField>
					</div>
				);
			})}
		</UIModal>
	);
};
