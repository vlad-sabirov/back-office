export interface IFormNameProps {
	value: string;
	error: string | undefined;
	onChange: (val: string) => void;
	onError: (val: string | undefined) => void;
	className?: string;
	required?: boolean;
}
