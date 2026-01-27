import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from "./Icon";
import { IconProps } from "./Icon.props";

const component: Meta<IconProps> = {
	component: Icon,
	title: 'fsd/shared/ui-kit/Icon',
	tags: ['autodocs'],
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' }
		}
	},
	argTypes: {
	}
};
type IComponent = StoryObj<typeof component>;

export default component;

export const Default: IComponent = {
	args: {
		name: 'alarm',
	},
};
