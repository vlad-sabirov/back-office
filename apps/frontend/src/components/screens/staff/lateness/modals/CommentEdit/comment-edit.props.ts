import { DetailedHTMLProps, FormHTMLAttributes } from 'react';
import { LatenessDataResponse } from '@interfaces';

export interface CommentEditProps extends DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
	data: LatenessDataResponse;
	isOpen: boolean;
	setOpen: (value: boolean) => void;
	onSuccess?: () => void;
}
