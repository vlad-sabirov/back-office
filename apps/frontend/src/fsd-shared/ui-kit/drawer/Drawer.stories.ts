/* eslint-disable @typescript-eslint/no-empty-function */
import type { Meta, StoryObj } from '@storybook/react';
import { Drawer } from "./Drawer";
import { DrawerProps } from './drawer.props';

const component: Meta<DrawerProps> = {
	component: Drawer,
	title: 'fsd/shared/ui-kit/Drawer',
	tags: ['autodocs'],
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' }
		}
	},
	argTypes: {
		opened: { control: { type: 'boolean' } },
		title: { control: { type: 'text' } },
		width: { control: { type: 'range', min: 320, max: 1200, step: 40 } },
		position: { control: 'inline-radio' },
		loading: { control: { type: 'boolean' } },
		children: { table: { disable: true } },
		titleSize: { table: { disable: true } },
		onClose: { table: { disable: true } },
	},
	args: {
		children: '',
		title: 'Title',
		opened: false,
		loading: false,
		onClose: () => {},
	},
};
type IComponent = StoryObj<typeof component>;

export default component;

export const Default: IComponent = {
	args: { opened: true },
};
