import { ReactNode } from 'react';
import { IVoipEvent } from '../../model/voip-slice-init.types';

export interface IUserAddProps {
	children: ReactNode;
	event: IVoipEvent;
	onDo: (phone: string) => void;
	isOpen: boolean;
	setIsOpen: (val: boolean) => void;
}
