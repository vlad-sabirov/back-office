import type { Meta, StoryObj } from '@storybook/react';
import { Button } from "./Button";
import { ButtonProps } from './Button.props';

const component: Meta<ButtonProps> = {
	component: Button,
	title: 'fsd/shared/ui-kit/Button',
	tags: ['autodocs'],
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' }
		}
	},
	argTypes: {
		color: { control: 'select' },
		size: { control: 'select' },
		variant: { control: 'inline-radio' },
		iconLeft: { table: { disable: true } },
		iconRight: { table: { disable: true } },
		children: { table: { disable: true } },
		onClick: { table: { disable: true } },
	}
};
type IComponent = StoryObj<typeof component>;

export default component;

export const Default: IComponent = {
	args: {
		children: 'Button text',
	},
};

export const PrimaryEasy: IComponent = {
	args: {
		...Default.args,
		color: 'primary',
	},
};

export const PrimaryHard: IComponent = {
	tags: ['primary', 'hard'],
	args: {
		...PrimaryEasy.args,
		variant: 'hard'
	},
};
