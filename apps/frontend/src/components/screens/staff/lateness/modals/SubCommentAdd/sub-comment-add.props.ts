import { DetailedHTMLProps, FormHTMLAttributes } from 'react';
import { LatenessDataResponse } from '@interfaces/lateness';

export interface CommentAddModalProps extends DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
	data: LatenessDataResponse | null;
	isOpen: boolean;
	setOpen: (value: boolean) => void;
	onSuccess?: () => void;
}

export interface CommentAddModalForm {
	comment: string;
}
