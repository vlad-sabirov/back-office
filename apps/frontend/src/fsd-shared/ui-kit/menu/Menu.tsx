import { Divider, Item, Label } from './components';
import { Menu as MantineMenu } from '@mantine/core';
import { MenuProps } from './props';
import css from './styles.module.scss';

const Menu = ({ width, control, children, className, ...props }: MenuProps): JSX.Element => {
	return (
		<>
			<MantineMenu {...props}>
				<MantineMenu.Target>
					<div className={className}>{control}</div>
				</MantineMenu.Target>

				<MantineMenu.Dropdown className={css.dropdown} style={{ minWidth: width || 180 }}>
					{children}
				</MantineMenu.Dropdown>
			</MantineMenu>
		</>
	);
};

Menu.Label = Label;
Menu.Item = Item;
Menu.Divider = Divider;

export { Menu };
