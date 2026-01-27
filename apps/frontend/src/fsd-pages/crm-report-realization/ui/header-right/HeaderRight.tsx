import { FC, useMemo } from 'react';
import cn from 'classnames';
import { parse } from 'date-fns';
import {
	CRM_REALIZATION_ACCESS,
	CRM_REALIZATION_CONFIG,
	useCrmRealizationBuildMonth,
} from '@fsd/entities/crm-realization';
import { useAccess, useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon } from '@fsd/shared/ui-kit';
import { ACCESS } from '../../config/constants';
import { useActions } from '../../libs';
import css from './header-right.module.scss';

const REBUILD_MIN_DATE = CRM_REALIZATION_CONFIG.REBUILD_MIN_DATE;
const FULL_ACCESS = ACCESS.FULL_ACCESS;

export const HeaderRight: FC = () => {
	const year = useStateSelector((state) => state.crm_realization.currentYear);
	const month = useStateSelector((state) => state.crm_realization.currentMonth);
	const isAccessRebuildPlan = useAccess({ access: CRM_REALIZATION_ACCESS.REBUILD_REALIZATION });
	const isLoading = useStateSelector((state) => state.crm_realization.isLoading);
	const isFetching = useStateSelector((state) => state.crm_realization.isFetching);
	const actions = useActions();
	const currentDate = useMemo(() => parse(`${year}-${month}`, 'yyyy-MM', new Date()), [month, year]);
	const isFullAccess = useAccess({ access: FULL_ACCESS });
	const type = useStateSelector((state) => state.crm_realization.type);

	const rebuildMonth = useCrmRealizationBuildMonth();

	const handlePlanModalOpen = () => {
		actions.setModal(['planList', true]);
	};

	return (
		<div className={cn(css.root, { [css.disabled]: isLoading || isFetching })}>
			{type === 'month' && isAccessRebuildPlan && currentDate >= REBUILD_MIN_DATE && (
				<Button color={'info'} iconLeft={<Icon name="refresh" />} onClick={() => rebuildMonth({ year, month })}>
					{' '}
					Пересобрать отчет{' '}
				</Button>
			)}

			{isFullAccess && (
				<Button color={'primary'} iconLeft={<Icon name="analytics" />} onClick={handlePlanModalOpen}>
					{' '}
					Планы{' '}
				</Button>
			)}
		</div>
	);
};
