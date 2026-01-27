import { Menu as MantineMenu, MenuDividerProps } from '@mantine/core';

const Divider = ({ ...props }: MenuDividerProps): JSX.Element => {
	return <MantineMenu.Divider {...props} />;
};

export { Divider };
