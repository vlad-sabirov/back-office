export interface IFormDueTimeProps {
	value: string;
	onChange: (val: string) => void;
	error: string;
	setError: (val: string | null) => void;
	required?: boolean;
}

export interface IFormDueTimeValidation {
	value: string;
	setError: (val: string | null) => void;
	required?: boolean;
}
