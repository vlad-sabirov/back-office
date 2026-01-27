import { FC } from 'react';
import { Skeleton } from '@fsd/shared/ui-kit';
import css from './styles.module.scss';

export const BirthdayUpcomingSkeleton: FC = () => {
	return (
		<div className={css.skeleton}>
			<Skeleton width="100%" height="120px" rounded="medium" />
			<Skeleton width="100%" height="120px" rounded="medium" />
		</div>
	);
};
