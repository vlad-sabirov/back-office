import cn from 'classnames';
import { Menu as MantineMenu } from '@mantine/core';
import { MenuLabelProps } from './props';
import css from './styles.module.scss';

const Label = ({ size = 'medium', children, className, ...props }: MenuLabelProps): JSX.Element => {
	const classNames = cn(
		{
			[css.root]: true,
			[css.sizeSmall]: size === 'small',
			[css.sizeMedium]: size === 'medium',
		},
		className
	);

	return (
		<MantineMenu.Label {...props} className={classNames}>
			{children}
		</MantineMenu.Label>
	);
};

export { Label };
