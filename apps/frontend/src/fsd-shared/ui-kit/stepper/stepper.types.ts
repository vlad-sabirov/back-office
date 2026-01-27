import { ButtonPropsInputColor, ButtonPropsInputVariant } from "@fsd/shared/ui-kit";
import { ReactNode } from "react";

export type StepperT = {
	steps: ReactNode[];
	activeStep?: number;
	skip?: boolean;
	loading?: boolean;
	setLoading?: (val: boolean) => void;
	stepsSpace?: number;
};

export type StepperStoreConfigT = {
	buttons?: StepperButtonsT;
}

export type StepperButtonsT = {
	next?: StepperButtonT;
	prev?: StepperButtonT;
	cancel?: StepperButtonT;
	finish?: StepperButtonT;
}

export type StepperButtonT = {
	name?: string;
	color?: typeof ButtonPropsInputColor[number];
	variant?: typeof ButtonPropsInputVariant[number];
	className?: string;
	event?: (res?: Record<string, unknown>) => void
	validate?: (res?: Record<string, unknown>) => void
	display?: boolean;
}
