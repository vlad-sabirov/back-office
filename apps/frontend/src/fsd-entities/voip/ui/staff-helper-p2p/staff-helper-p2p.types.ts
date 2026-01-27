import { ReactNode } from 'react';

export interface IStaffHelperP2PProps {
	searchInput: string;
	children: ReactNode;
	width: number | string;
	height: number | string;
	isOpen: boolean;
	setIsOpen: (val: boolean) => void;
	onDo: (phone: string, name: string) => void;
	ignorePhones?: string[];
}
