import { ButtonProps } from '@fsd/shared/ui-kit';

export interface CallButtonProps extends Omit<ButtonProps, 'iconLeft' | 'iconRight' | 'children'> {
	phoneMobile?: string;
	phoneVoip?: string;
}
