import { FC } from 'react';
import cn from 'classnames';
import { Progress as MantineProgress } from '@mantine/core';
import { TextField } from '@fsd/shared/ui-kit';
import { IProgressProps } from '.';
import css from './styles.module.scss';
import cssColor from './styles/color.module.scss';
import cssSize from './styles/size.module.scss';

export const Progress: FC<IProgressProps> = ({
	label,
	size = 'medium',
	color = 'primary',
	labelDirection = 'top',
	disabled = false,
	value,
	className,
}) => {
	const classNamesProgress = cn(
		css.progress,
		{
			[cssSize.extraSmall]: size === 'extraSmall',
			[cssSize.small]: size === 'small',
			[cssSize.medium]: size === 'medium',
			[cssSize.large]: size === 'large',
		},
		{
			[cssColor.primary]: color === 'primary',
			[cssColor.green]: color === 'green',
			[cssColor.yellow]: color === 'yellow',
			[cssColor.red]: color === 'red',
		}
	);

	const classNamesRoot = cn(
		css.root,
		{
			[css.labelDirection__top]: labelDirection === 'top',
			[css.labelDirection__bottom]: labelDirection === 'bottom',
			[css.labelDirection__left]: labelDirection === 'left',
			[css.labelDirection__right]: labelDirection === 'right',
		},
		className,
		{ [css.disabled]: disabled }
	);

	return (
		<div className={classNamesRoot}>
			{label && (
				<TextField className={css.label} size={size === 'extraSmall' || size === 'small' ? 'small' : 'medium'}>
					{label}
				</TextField>
			)}

			<MantineProgress value={value} className={classNamesProgress} />
		</div>
	);
};
