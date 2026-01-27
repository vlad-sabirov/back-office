import cn from 'classnames';
import { TextField } from '@fsd/shared/ui-kit';
import { ChipProps } from './props';
import css from './styles.module.scss';
import cssColor from './styles/color.module.scss';
import cssSize from './styles/size.module.scss';

export const Chip = ({
	data,
	size = 'medium',
	color = 'transparent',
	leftSide,
	rightSide,
	className,
	disabled,
	...props
}: ChipProps): JSX.Element => {
	const classNames = cn(
		{
			[css.root]: true,
			[cssSize.sizeExtraSmall]: size === 'extraSmall',
			[cssSize.sizeSmall]: size === 'small',
			[cssSize.sizeMedium]: size === 'medium',
			[cssSize.sizeLarge]: size === 'large',
			[cssColor.colorNeutral]: color === 'neutral',
			[cssColor.colorPrimary]: color === 'primary',
			[cssColor.colorInfoHard]: color === 'infoHard',
			[cssColor.colorMale]: color === 'male',
			[cssColor.colorFemale]: color === 'female',
			[cssColor.colorOther]: color !== 'neutral' && color !== 'primary' && color !== 'male' && color !== 'female',
		},
		className,
		{ [css.disabled]: disabled }
	);

	const otherColor =
		color !== 'transparent' && color !== 'neutral' && color !== 'primary' && color !== 'male' && color !== 'female';

	return (
		<div className={classNames} {...props} style={{ backgroundColor: otherColor ? color + '11' : undefined }}>
			{leftSide ? <div className={css.leftSide}>{leftSide}</div> : null}
			<TextField className={cssSize.data}>{data}</TextField>
			{rightSide ? <div className={css.rightSide}>{rightSide}</div> : null}
		</div>
	);
};
