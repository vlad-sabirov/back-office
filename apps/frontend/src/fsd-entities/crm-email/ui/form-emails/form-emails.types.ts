import { IEmailFormEntity } from "../../entity";

export interface IFormEmailsProps {
	value: IEmailFormEntity[];
	error: Record<number, string> | undefined;
	onChange: (val: IEmailFormEntity[]) => void;
	onError: (val: Record<number, string> | undefined) => void;
	required?: boolean;
	ignoreEmails?: string[];
	data?: IEmailFormEntity[];
	className?: string;
}
