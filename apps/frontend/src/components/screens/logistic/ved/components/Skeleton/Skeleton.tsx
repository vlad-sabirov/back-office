import { FC } from 'react';
import { Skeleton as SkeletonUI } from '@fsd/shared/ui-kit';
import { SkeletonProps } from '.';
import css from './Skeleton.module.scss';

export const Skeleton: FC<SkeletonProps> = ({ view, ...props }) => {
	return view === 'kanban' ? (
		<div className={css.kanban} {...props}>
			<div className={css.col}>
				<SkeletonUI width={300} height={100} rounded={'large'} />
				<SkeletonUI width={300} height={90} rounded={'large'} />
				<SkeletonUI width={300} height={75} rounded={'large'} />
				<SkeletonUI width={300} height={120} rounded={'large'} />
				<SkeletonUI width={300} height={100} rounded={'large'} />
				<SkeletonUI width={300} height={160} rounded={'large'} />
				<SkeletonUI width={300} height={120} rounded={'large'} />
				<SkeletonUI width={300} height={100} rounded={'large'} />
			</div>

			<div className={css.col}>
				<SkeletonUI width={300} height={190} rounded={'large'} />
				<SkeletonUI width={300} height={100} rounded={'large'} />
				<SkeletonUI width={300} height={125} rounded={'large'} />
				<SkeletonUI width={300} height={80} rounded={'large'} />
				<SkeletonUI width={300} height={130} rounded={'large'} />
				<SkeletonUI width={300} height={140} rounded={'large'} />
			</div>

			<div className={css.col}>
				<SkeletonUI width={300} height={100} rounded={'large'} />
				<SkeletonUI width={300} height={120} rounded={'large'} />
				<SkeletonUI width={300} height={160} rounded={'large'} />
				<SkeletonUI width={300} height={100} rounded={'large'} />
				<SkeletonUI width={300} height={120} rounded={'large'} />
				<SkeletonUI width={300} height={75} rounded={'large'} />
				<SkeletonUI width={300} height={90} rounded={'large'} />
			</div>
		</div>
	) : (
		<div className={css.list} {...props}>
			<SkeletonUI width={'100%'} height={40} rounded={'large'} />
			<SkeletonUI width={'100%'} height={40} rounded={'large'} />
			<SkeletonUI width={'100%'} height={40} rounded={'large'} />
			<SkeletonUI width={'100%'} height={40} rounded={'large'} />
			<SkeletonUI width={'100%'} height={40} rounded={'large'} />
			<SkeletonUI width={'100%'} height={40} rounded={'large'} />
			<SkeletonUI width={'100%'} height={40} rounded={'large'} />
			<SkeletonUI width={'100%'} height={40} rounded={'large'} />
			<SkeletonUI width={'100%'} height={40} rounded={'large'} />
			<SkeletonUI width={'100%'} height={40} rounded={'large'} />
		</div>
	);
};
