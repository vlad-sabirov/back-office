import { stringFormatToLetters } from "@fsd/shared/lib/string-format";
import { useCallback, useMemo } from "react";
import { Const } from "../../config/const";
import { IFormNameProps } from "./form-name.types";

export const useValidate = (props: IFormNameProps) => {
	const { value, required, onError } = props;
	const valueLetters = useMemo(() => stringFormatToLetters(value), [value]);

	return useCallback(async (): Promise<boolean> => {
		if (!required && !valueLetters.length) {
			return true;
		}

		if (valueLetters.length < Const.Form.Name.MinLetters.Count) {
			onError(Const.Form.Name.MinLetters.Message);
			return false;
		}

		if (value.length > Const.Form.Name.MaxLength.Count) {
			onError(Const.Form.Name.MaxLength.Message);
			return false;
		}

		return true;
	}, [required, valueLetters.length, value.length, onError]);
};
