import { IVoipEvent } from '@fsd/entities/voip/model/voip-slice-init.types';

export interface ICallersProps {
	isShowPopover: (val: boolean) => void;
}
export interface ICallerProps {
	call: IVoipEvent;
}
