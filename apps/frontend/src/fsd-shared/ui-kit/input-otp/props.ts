import { TextInputProps } from '@mantine/core';

export const InputOtpPropsInputSize = ['small', 'medium', 'large'] as const;

export interface InputOtpProps extends Omit<TextInputProps, 'size' | 'onChange'> {
	value?: string;
	size?: typeof InputOtpPropsInputSize[number];
	length?: number;
	isInputSecure?: boolean;
	onChange?: (value: string) => void;
}

type RefObject<T> = { current: T | null };
type RefCallback<T> = { bivarianceHack(instance: T | null): void }['bivarianceHack'];
type Ref<T> = RefCallback<T> | RefObject<T> | null;
export type LegacyRef<T> = string | Ref<T>;
