export interface IFormDescriptionProps {
	value: string;
	onChange: (val: string) => void;
	error: string;
	setError: (val: string | null) => void;
	required?: boolean;
}

export interface IFormDescriptionValidation {
	value: string;
	setError: (val: string) => void;
	required?: boolean;
}
