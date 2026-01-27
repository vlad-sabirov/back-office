import { FC } from 'react';
import { ContentBlock, Skeleton } from '@fsd/shared/ui-kit';
import css from './vacation-list.module.scss';

export const VacationListSkeleton: FC = () => {
	return (
		<ContentBlock className={css.skeleton}>
			<Skeleton width={'100%'} height={40} rounded={'large'} />
			<Skeleton width={'100%'} height={40} rounded={'large'} />
			<Skeleton width={'100%'} height={40} rounded={'large'} />
			<Skeleton width={'100%'} height={40} rounded={'large'} />
			<Skeleton width={'100%'} height={40} rounded={'large'} />
			<Skeleton width={'100%'} height={40} rounded={'large'} />
			<Skeleton width={'100%'} height={40} rounded={'large'} />
			<Skeleton width={'100%'} height={40} rounded={'large'} />
			<Skeleton width={'100%'} height={40} rounded={'large'} />
		</ContentBlock>
	);
};
