import { DetailedHTMLProps, HTMLAttributes } from 'react';

export interface MidjourneyModalProps extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
	opened: boolean;
	setOpened: (val: boolean) => void;
}
