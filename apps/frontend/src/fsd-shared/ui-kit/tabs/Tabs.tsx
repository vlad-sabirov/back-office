import { List, Panel, Tab } from './components';
import cn from 'classnames';
import { Tabs as MantineTabs } from '@mantine/core';
import { TabsProps } from './Tabs.props';
import css from './styles.module.scss';
import cssColor from './styles/color.module.scss';
import cssSize from './styles/size.module.scss';

const Tabs = (
	{ size = 'medium', color = 'primary', children, className, orientation, ...props }: TabsProps
): JSX.Element => {
	const classNames = cn(
		{
			[css.wrapper]: true,
			[cssSize.sizeSmall]: size === 'small',
			[cssSize.sizeMedium]: size === 'medium',
			[cssSize.sizeLarge]: size === 'large',
			[cssColor.colorNeutral]: color === 'neutral',
			[cssColor.colorPrimary]: color === 'primary',
			[cssSize.vertical]: orientation === 'vertical',
		},
		className
	);

	return (
		<MantineTabs className={classNames} orientation={orientation} {...props}>
			{children}
		</MantineTabs>
	);
};

Tabs.Panel = Panel;
Tabs.List = List;
Tabs.Tab = Tab;

export { Tabs };
