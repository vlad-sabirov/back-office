import { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface CommentAddProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	orderId: number;
}
