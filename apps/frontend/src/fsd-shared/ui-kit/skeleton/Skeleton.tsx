import { FC } from 'react';
import cn from 'classnames';
import { Skeleton as MantineSkeleton } from '@mantine/core';
import { SkeletonProps } from '.';
import css from './styles.module.scss';
import cssRounded from './styles/rounded.module.scss';

export const Skeleton: FC<SkeletonProps> = (props) => {
	const { width, height, className, rounded, ...otherProps } = props;

	const classNames = cn(
		css.root,
		{
			[cssRounded.none]: !rounded || rounded === 'none',
			[cssRounded.small]: rounded === 'small',
			[cssRounded.medium]: rounded === 'medium',
			[cssRounded.large]: rounded === 'large',
			[cssRounded.circle]: rounded === 'circle',
		},
		className
	);

	return <MantineSkeleton width={width || '100%'} height={height || '100%'} className={classNames} {...otherProps} />;
};
