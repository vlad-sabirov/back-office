import { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface JsonPreProps extends DetailedHTMLProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement> {
	data: unknown;
}
