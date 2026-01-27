import { DetailedHTMLProps, FormHTMLAttributes } from 'react';
import { LatenessDataResponse } from '@interfaces/lateness';

export interface CommentEditModalProps extends DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
	data: LatenessDataResponse | null;
	commentID: number;
	isOpen: boolean;
	setOpen: (value: boolean) => void;
	onSuccess?: () => void;
}

export interface CommentEditModalForm {
	comment: string;
}
