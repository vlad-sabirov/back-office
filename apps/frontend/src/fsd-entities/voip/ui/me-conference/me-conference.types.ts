import { IVoipEvent } from '@fsd/entities/voip/model/voip-slice-init.types';

export interface IMeConferenceProps {
	event: IVoipEvent;
	isShowPopover: (val: boolean) => void;
}
