import { ButtonProps } from "@fsd/shared/ui-kit";
import { StepperButtonT } from "../../stepper.types";

export type ButtonPropsT = {
	buttonType: 'next' | 'prev' | 'finish' | 'cancel';
	active: number;
	setActive: (val: number) => void;
	isDisplay: boolean;
} & StepperButtonT & Omit<ButtonProps, 'name' | 'color' | 'variant' | 'className' | 'event' | 'children' | 'loading'>;
