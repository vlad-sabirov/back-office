export type IColors = 'red' | 'yellow' | 'green' | 'purple' | undefined;

export interface IFormColorProps {
	value: IColors;
	error: string | undefined;
	onChange: (val: string) => void;
	onError: (val: string | undefined) => void;
	className?: string;
	required?: boolean;
}
