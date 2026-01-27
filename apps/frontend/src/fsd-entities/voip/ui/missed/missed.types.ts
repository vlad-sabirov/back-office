import { IVoipMissed } from '../../model/voip-slice-init.types';

export interface IMissedProps {
	missedCalls: IVoipMissed[];
	className?: string;
	isShowPopover: (val: boolean) => void;
}
