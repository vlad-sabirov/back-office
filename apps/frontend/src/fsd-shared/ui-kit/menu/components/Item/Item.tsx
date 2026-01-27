import cn from 'classnames';
import { Menu as MantineMenu } from '@mantine/core';
import { MenuItemProps } from './props';
import css from './styles.module.scss';

const Item = ({ color = 'standard', icon, iconRight, children, ref, ...props }: MenuItemProps): JSX.Element => {
	const classNames = cn({
		[css.root]: true,
		[css.colorStandard]: color === 'standard',
		[css.colorOrange]: color === 'orange',
		[css.colorBlue]: color === 'blue',
		[css.colorRed]: color === 'red',
	});

	return (
		<MantineMenu.Item icon={icon} {...props} rightSection={iconRight} className={classNames} ref={ref}>
			{children}
		</MantineMenu.Item>
	);
};

export { Item };
