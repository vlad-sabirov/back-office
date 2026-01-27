import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { LatenessDataResponse } from '@interfaces';

export interface SubCommentDeleteModalProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	data: LatenessDataResponse | null;
	commentID: number;
	isOpen: boolean;
	setOpen: (value: boolean) => void;
	onSuccess?: () => void;
}
