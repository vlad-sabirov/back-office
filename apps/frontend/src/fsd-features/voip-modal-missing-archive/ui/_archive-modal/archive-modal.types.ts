import { IVoipMissingCallsResponse } from '@fsd/entities/voip';

export interface IArchiveModalProps {
	calls: IVoipMissingCallsResponse[];
	isOpen: boolean;
	setIsOpen: (val: boolean) => void;
}
