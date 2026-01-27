// noinspection JSUnusedGlobalSymbols

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from "@fsd/shared/ui-kit";
import { Modal } from "./Modal";
import { ModalProps } from './Modal.props';

const Component = {
	component: Modal,
	title: 'fsd/shared/ui-kit/Modal',
	tags: ['autodocs'],
	args: {
		title: 'Заголовок',
		opened: false,
		loading: false,
		onClose: () => null,
		size: 400,
		children: (<>
			<Modal.Buttons>
				<Button>Отмена</Button>
				<Button color='primary' variant='hard'>Действие</Button>
			</Modal.Buttons>
		</>)
	},
	argTypes: {
		title: { control: 'text' },
		opened: { control: 'boolean' },
		loading: { control: 'boolean' },
		size: { control: { type: 'range', min: 320, max: 1200, step: 40 } },
		children: { table: { disable: true } },
		onClose: { table: { disable: true } },
	},
	parameters: {
		docs: {
			canvas: { sourceState: 'shown' }
		}
	},
} satisfies Meta<ModalProps>;
type IComponent = StoryObj<typeof Component>;

export default Component;

export const Default: IComponent = {
	args: { opened: true, }
};

