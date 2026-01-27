import { CSSProperties, DetailedHTMLProps, HTMLAttributes } from 'react';

export interface AvatarChangerProps
	extends Omit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'onChange'> {
	backgroundColor?: string;
	value?: string;
	onChange?: (value: string) => void;
	style?: CSSProperties;
}
