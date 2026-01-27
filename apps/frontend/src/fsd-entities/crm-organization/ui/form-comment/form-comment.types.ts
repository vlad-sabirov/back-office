export interface IFormCommentProps {
	value: string;
	error: string | undefined;
	onChange: (val: string) => void;
	onError: (val: string | undefined) => void;
	required?: boolean;
}

