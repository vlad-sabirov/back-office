import { TextFiendPropsSize } from "@fsd/shared/ui-kit";

export interface CallButtonWithTextProps {
	phone?: string;
	whoDescription?: string;
	className?: string;
	disabled?: boolean;
	size?: typeof TextFiendPropsSize[number];
}
