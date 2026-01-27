export interface IFormDueDateProps {
	value: string;
	onChange: (val: string) => void;
	error: string;
	setError: (val: string | null) => void;
	required?: boolean;
}

export interface IFormDueDateValidation {
	value: string;
	setError: (val: string | null) => void;
	required?: boolean;
}
