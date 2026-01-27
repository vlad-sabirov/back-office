export interface IFormFirstDocumentProps {
	value: string;
	error: string | undefined;
	onChange: (val: string) => void;
	onError: (val: string | undefined) => void;
	required?: boolean;
}

