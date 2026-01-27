export interface IFormAssigneeProps {
	value: number;
	onChange: (val: number) => void;
	error: string;
	setError: (val: string | null) => void;
	required?: boolean;
}

export interface IFormAssigneeValidation {
	value: number;
	setError: (val: string | null) => void;
	required?: boolean;
}
