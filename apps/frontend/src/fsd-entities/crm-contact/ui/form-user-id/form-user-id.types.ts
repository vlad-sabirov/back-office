import { IStaffEntity } from "@fsd/entities/staff";

export interface IFormUserIdProps {
	value: string;
	error: string | undefined;
	users: IStaffEntity[];
	onChange: (val: string) => void;
	onError: (val: string | undefined) => void;
	className?: string;
	required?: boolean;
}
