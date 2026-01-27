import { FC, useEffect, useMemo, useState } from 'react';
import { IRealizationOnlyTypes } from './realization-only.types';
import { useCrmRealizationGetDataMonthAll } from '@fsd/entities/crm-realization';
import { CrmRealizationHistoryChartFeature } from '@fsd/features/crm-realization-history-chart';
import { CrmRealizationHistoryListFeature } from '@fsd/features/crm-realization-history-list';
import { ContentBlock, SegmentedControl } from '@fsd/shared/ui-kit';
import css from './realization-only.module.scss';

export const RealizationOnly: FC<IRealizationOnlyTypes> = (props) => {
	const { userId, parentId } = props;
	const dataAll = useCrmRealizationGetDataMonthAll();
	const [type, setType] = useState<'team' | 'employee'>('team');

	const isTeam = useMemo(() => !!dataAll?.getEmployeeByUserId(userId)?.length, [dataAll, userId]);

	useEffect(() => {
		setType(isTeam ? 'employee' : 'team');
	}, [isTeam]);

	const historyAllChart = useMemo(() => {
		const output =
			type === 'team' ? dataAll?.getTeamByUserId(parentId || userId) : dataAll?.getEmployeeByUserId(userId);
		if (!output) return [];
		output.pop();
		return output;
	}, [dataAll, parentId, type, userId]);

	const historyAllList = useMemo(() => {
		const output =
			type === 'team'
				? dataAll?.getTeamByUserId(parentId || userId).filter((report) => report.realization)
				: dataAll?.getEmployeeByUserId(userId).filter((report) => report.realization);
		if (!output) return [];
		output.reverse();
		return output;
	}, [dataAll, parentId, type, userId]);

	return (
		<div className={css.root}>
			{isTeam && (
				<SegmentedControl
					color={'primary'}
					size={'large'}
					value={type}
					data={[
						{ value: 'employee', label: 'Сотрудник' },
						{ value: 'team', label: 'Команда' },
					]}
					onChange={(val) => setType(val as 'team')}
					className={css.employeeOrTeam}
				/>
			)}

			<ContentBlock className={css.history}>
				<CrmRealizationHistoryChartFeature data={historyAllChart} height={200} />
			</ContentBlock>

			<ContentBlock>
				<CrmRealizationHistoryListFeature
					data={historyAllList}
					all={dataAll}
					userId={userId}
					parentId={parentId}
					type={type}
					withDiff
				/>
			</ContentBlock>
		</div>
	);
};
