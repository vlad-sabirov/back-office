import { FC } from 'react';
import { Tabs, TabsListProps } from '@mantine/core';

export const List: FC<TabsListProps> = ({ children, ...props }) => <Tabs.List {...props}>{children}</Tabs.List>;
