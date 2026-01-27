import { FC } from 'react';
import { ContentBlock, Skeleton } from '@fsd/shared/ui-kit';
import { BodyRightProps } from '.';
import css from './body-right.module.scss';

export const BodyRightSkeleton: FC<Omit<BodyRightProps, 'data'>> = (props) => {
	return (
		<div {...props} className={css.skeleton}>
			<ContentBlock className={css.skeleton__header}>
				<Skeleton height={40} width={40} rounded={'circle'} />
				<Skeleton height={40} width={200} rounded={'medium'} />
				<Skeleton height={40} width={125} rounded={'medium'} />
			</ContentBlock>

			<ContentBlock className={css.skeleton__table}>
				{Array(30)
					.fill(1)
					.map((x, i) => (
						<div key={i}>
							<Skeleton height={20} rounded={'medium'} />
							<Skeleton height={20} rounded={'medium'} />
							<Skeleton height={20} rounded={'medium'} />
						</div>
					))}
			</ContentBlock>
		</div>
	);
};
