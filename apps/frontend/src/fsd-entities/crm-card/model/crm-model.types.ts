import { Types } from "../config/enums";

export interface IReducer {
	isShow: boolean;
	isLoading: boolean;
	isFetching: boolean;
	isUpdate: boolean;
	status: string | null;
	title: string | null;
	type: Types | null;
}
