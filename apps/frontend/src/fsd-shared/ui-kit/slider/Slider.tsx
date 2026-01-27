import { ForwardedRef, forwardRef } from 'react';
import cn from 'classnames';
import { Icon } from '@fsd/shared/ui-kit';
import { Slider as MantineSlider } from '@mantine/core';
import { TextField } from '..';
import { SliderProps } from './Slider.props';
import css from './Styles.module.scss';

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
	(
		{ size = 'medium', labelName, className, ...props }: SliderProps,
		ref: ForwardedRef<HTMLInputElement>
	): JSX.Element => {
		const classNames = cn(
			{
				[css.root]: true,
				[css.sizeMedium]: size === 'medium',
				[css.sizeLarge]: size === 'large',
			},
			className,
			{ [css.disabled]: props.disabled }
		);

		return (
			<div className={classNames}>
				{labelName && (
					<TextField size="small" className={css.label}>
						{labelName}
					</TextField>
				)}
				<MantineSlider thumbChildren={<Icon name="dots-eight" />} {...props} ref={ref} />
			</div>
		);
	}
);

Slider.displayName = 'Slider';
