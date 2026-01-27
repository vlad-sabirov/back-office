import { IPhoneFormEntity } from "../../entity";

export interface IFormPhonesProps {
	value: IPhoneFormEntity[];
	error: Record<number, string> | undefined;
	onChange: (val: IPhoneFormEntity[]) => void;
	onError: (val: Record<number, string> | undefined) => void;
	required?: boolean;
	isVoipSkip?: boolean;
	ignorePhones?: string[];
	data?: IPhoneFormEntity[];
	className?: string;
}

