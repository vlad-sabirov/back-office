import { ReactNode } from 'react';

export const StepperPropsMode = ['standard', 'edit'] as const;

interface StepperV1PropsSteps {
	display: ReactNode;
	validation?: () => void;
	onSuccess?: (res?: unknown) => void;
}

interface StepperV1PropsFinish {
	buttonName?: string;
	onChange?: () => void;
}

interface StepperV1PropsCancel {
	buttonName?: string;
	onChange?: () => void;
}

export interface StepperV1Props {
	mode?: typeof StepperPropsMode[number];
	steps: StepperV1PropsSteps[];
	cancel?: StepperV1PropsCancel;
	finish?: StepperV1PropsFinish;
	buttons?: boolean;
	className?: string;
	loading?: boolean;
	disabled?: boolean;
}
