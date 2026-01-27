import cn from 'classnames';
import { Loader, Button as MantineButton } from '@mantine/core';
import { forwardRef } from "react";
import { ButtonProps } from './Button.props';
import css from './Styles.module.scss';

export const Button = forwardRef<HTMLButtonElement ,ButtonProps>((
	{
		color = 'neutral',
		size = 'medium',
		variant = 'easy',
		iconLeft,
		iconRight,
		children,
		className,
		loaderPosition,
		loading,
		...props
	}, ref) => {
	const classNames = cn(
		{
			[css.root]: true,
			[css.color__transparent]: color === 'transparent',
			[css.color__neutral__easy]: color === 'neutral' && variant === 'easy',
			[css.color__neutral__hard]: color === 'neutral' && variant === 'hard',
			[css.color__primary__easy]: color === 'primary' && variant === 'easy',
			[css.color__primary__hard]: color === 'primary' && variant === 'hard',
			[css.color__info__easy]: color === 'info' && variant === 'easy',
			[css.color__info__hard]: color === 'info' && variant === 'hard',
			[css.color__success__easy]: color === 'success' && variant === 'easy',
			[css.color__success__hard]: color === 'success' && variant === 'hard',
			[css.color__warning__easy]: color === 'warning' && variant === 'easy',
			[css.color__warning__hard]: color === 'warning' && variant === 'hard',
			[css.color__error__easy]: color === 'error' && variant === 'easy',
			[css.color__error__hard]: color === 'error' && variant === 'hard',
			[css.size_small]: size === 'small',
			[css.size_medium]: size === 'medium',
			[css.size_large]: size === 'large',
			[css.size_extraLarge]: size === 'extraLarge',
		},
		className,
		{ [css.disabled]: props.disabled }
	);

	return (
		<MantineButton
			className={classNames}
			leftIcon={loading ? <Loader className={css.loader} /> : iconLeft}
			loaderPosition={loaderPosition ?? 'right'}
			rightIcon={iconRight}
			ref={ref}
			{...props}
		>
			{children}
		</MantineButton>
	);
});

Button.displayName = 'Button';
