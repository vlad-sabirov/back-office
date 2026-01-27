import { FC } from 'react';
import { TabProps, Tabs } from '@mantine/core';

export const Tab: FC<TabProps> = ({ children, ...props }) => <Tabs.Tab {...props}>{children}</Tabs.Tab>;
