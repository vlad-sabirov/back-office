import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { RequisiteAddSuccessT } from '..';

export type RequisiteDeleteModalProps = {
	opened: boolean;
	setOpened: (val: boolean) => void;
	current: RequisiteAddSuccessT | null;
	onSuccess: (res: RequisiteAddSuccessT) => void;
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
