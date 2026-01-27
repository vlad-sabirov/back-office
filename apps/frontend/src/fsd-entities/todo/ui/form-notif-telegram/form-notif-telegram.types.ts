export interface IFormNotifTelegramProps {
	value: boolean;
	onChange: (val: boolean) => void;
	error: string;
	setError: (val: string | null) => void;
	required?: boolean;
	disabled?: boolean;
}

export interface IFormNotifTelegramValidation {
	value: boolean;
	setError: (val: string | null) => void;
	required?: boolean;
}
