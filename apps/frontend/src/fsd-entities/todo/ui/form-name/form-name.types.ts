export interface IFormNameProps {
	value: string;
	onChange: (val: string) => void;
	error: string;
	setError: (val: string | null) => void;
	required?: boolean;
}

export interface IFormNameValidation {
	value: string;
	setError: (val: string | null) => void;
	required?: boolean;
}
