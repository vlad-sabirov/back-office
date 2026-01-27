export interface IModalProps {
	isOpen: boolean;
	setIsOpen: (val: boolean) => void;
	type: 'team' | 'employee';
	userId: number | null;
	teamIds: number[] | null;
}
