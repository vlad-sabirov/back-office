import { ReactNode } from 'react';
import { IVoipEvent } from '../../model/voip-slice-init.types';

export interface IHangupProps {
	children: ReactNode;
	event: IVoipEvent;
}
