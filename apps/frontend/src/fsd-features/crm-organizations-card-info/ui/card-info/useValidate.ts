import { Const } from "../../config/const";
import { ICardInfo } from "./card-info.types";

export const useValidate = (
	{ changeField, onChange, value, required }: ICardInfo
) => {
	return async (): Promise<boolean> => {
		if (required && value && !value.length) {
			onChange({ field: changeField, value, error: Const.Validate.Required });
			return false;
		}

		return true;
	};
}
