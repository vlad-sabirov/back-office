export interface IFromTagsProps {
	label?: string;
	searchable?: boolean;
	creatable?: boolean;
	value: string[];
	error: string | undefined;
	onChange: (val: string[]) => void;
	onError: (val: string | undefined) => void;
	className?: string;
	required?: boolean;
}
