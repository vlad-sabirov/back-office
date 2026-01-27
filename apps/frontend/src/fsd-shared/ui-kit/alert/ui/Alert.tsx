import cn from 'classnames';
import { TextField } from '@fsd/shared/ui-kit';
import { AlertT } from '../types/alert.types';
import css from './alert.module.scss';

const Alert = ({
	title,
	body,
	size = 'medium',
	color = 'neutral',
	variant = 'light',
	icon,
	className,
	...props
}: AlertT): JSX.Element => {
	const classNames = cn(
		{
			[css.root]: true,
			[css.sizeSmall]: size === 'small',
			[css.sizeMedium]: size === 'medium',
			[css.sizeLarge]: size === 'large',
			[css.colorNeutral__light]: color === 'neutral' && variant === 'light',
			[css.colorNeutral__filled]: color === 'neutral' && variant === 'filled',
			[css.colorNeutral__outline]: color === 'neutral' && variant === 'outline',
			[css.colorPrimary__light]: color === 'primary' && variant === 'light',
			[css.colorPrimary__filled]: color === 'primary' && variant === 'filled',
			[css.colorPrimary__outline]: color === 'primary' && variant === 'outline',
			[css.colorSuccess__light]: color === 'success' && variant === 'light',
			[css.colorSuccess__filled]: color === 'success' && variant === 'filled',
			[css.colorSuccess__outline]: color === 'success' && variant === 'outline',
			[css.colorWarning__light]: color === 'warning' && variant === 'light',
			[css.colorWarning__filled]: color === 'warning' && variant === 'filled',
			[css.colorWarning__outline]: color === 'warning' && variant === 'outline',
			[css.colorError__light]: color === 'error' && variant === 'light',
			[css.colorError__filled]: color === 'error' && variant === 'filled',
			[css.colorError__outline]: color === 'error' && variant === 'outline',
			[css.colorInfo__light]: color === 'info' && variant === 'light',
			[css.colorInfo__filled]: color === 'info' && variant === 'filled',
			[css.colorInfo__outline]: color === 'info' && variant === 'outline',
		},
		className
	);

	return (
		<div className={classNames} {...props}>
			<div className={css.icon}>{icon}</div>
			<TextField className={css.title}>{title}</TextField>
			<TextField className={css.body}>{body}</TextField>
		</div>
	);
};

export default Alert;
