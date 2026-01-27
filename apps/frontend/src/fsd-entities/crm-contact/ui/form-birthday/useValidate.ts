import { parse, sub } from "date-fns";
import { useCallback } from "react";
import { Const } from "../../config/const";
import { IFormBirthdayProps } from "./form-birthday.types";

export const useValidate = (props: IFormBirthdayProps) => {
	const { value, required, onError } = props;

	return useCallback(async (): Promise<boolean> => {
		if (!required && !value) {
			return true;
		}

		// Если поле обязательное, но пустое
		if (!value) {
			onError(Const.Form.Birthday.IsRequired);
			return false;
		}
		const valueDate = parse(value, 'yyyy-MM-dd', new Date());

		// Если указанна дата больше минимальной
		const minAgeDate = sub(new Date(), { years: Const.Form.Birthday.MinAge.Count });
		if (valueDate > minAgeDate) {
			onError(Const.Form.Birthday.MinAge.Message);
			return false;
		}

		// Если указанна дата меньше максимальной
		const maxAgeDate = sub(new Date(), { years: Const.Form.Birthday.MaxAge.Count });
		if (valueDate < maxAgeDate) {
			onError(Const.Form.Birthday.MaxAge.Message);
			return false;
		}

		return true;
	}, [onError, required, value]);
};
