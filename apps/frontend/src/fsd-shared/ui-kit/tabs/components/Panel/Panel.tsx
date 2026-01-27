import { FC } from 'react';
import { Tabs, TabsPanelProps } from '@mantine/core';

export const Panel: FC<TabsPanelProps> = ({ children, ...props }) => <Tabs.Panel {...props}>{children}</Tabs.Panel>;
