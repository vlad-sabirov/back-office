import { FC } from 'react';
import { Skeleton } from '@fsd/shared/ui-kit';
import css from './LogisticVedDashboardSkeleton.module.scss';

export const LogisticVedDashboardSkeleton: FC = () => {
	return (
		<div className={css.root}>
			<Skeleton width="60%" height="60px" rounded="medium" />
			<div>
				<Skeleton width="100%" height="40px" rounded="medium" />
				<Skeleton width="100%" height="40px" rounded="medium" />
				<Skeleton width="100%" height="40px" rounded="medium" />
			</div>
		</div>
	);
};
