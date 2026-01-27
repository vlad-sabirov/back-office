import { ReactNode } from 'react';
import { IVoipEvent } from '../../model/voip-slice-init.types';

export interface IRedirectProps {
	children: ReactNode;
	event: IVoipEvent;
}
