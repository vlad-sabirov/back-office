import { IVoipEvent } from '../../model/voip-slice-init.types';

export interface IMeP2pProps {
	event: IVoipEvent;
	isShowPopover: (val: boolean) => void;
}
