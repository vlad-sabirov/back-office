import cn from 'classnames';
import { SegmentedControlProps, TextField } from '@fsd/shared/ui-kit';
import { SegmentedControl as MantineSegmentedControl } from '@mantine/core';
import css from './Styles.module.scss';

export const SegmentedControl = ({
	color = 'lighten',
	size = 'medium',
	label,
	required,
	className,
	...props
}: SegmentedControlProps): JSX.Element => {
	const classNames = cn({
		[css.root]: true,
		[css.size_medium]: size === 'medium',
		[css.size_large]: size === 'large',
		[css.size_extraLarge]: size === 'extraLarge',
		[css.color_lighten]: color === 'lighten',
		[css.color_darken]: color === 'darken',
		[css.color_primary]: color === 'primary',
		[css.color_male]: color === 'male',
		[css.color_female]: color === 'female',
	});

	return (
		<div className={cn(css.wrapper, { [css.disabled]: props.disabled }, className)}>
			{label && (
				<TextField size="small" className={css.label}>
					{label}
					{required && <span className={css.required}> *</span>}
				</TextField>
			)}
			<MantineSegmentedControl className={classNames} {...props} />
		</div>
	);
};
