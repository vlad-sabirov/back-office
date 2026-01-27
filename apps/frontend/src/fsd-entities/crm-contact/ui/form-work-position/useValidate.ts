import { stringFormatToLetters } from "@fsd/shared/lib/string-format";
import { useCallback, useMemo } from "react";
import { Const } from "../../config/const";
import { IFormWorkPositionProps } from "./form-work-position.types";

export const useValidate = (props: IFormWorkPositionProps) => {
	const { value, required, onError } = props;
	const valueLetters = useMemo(() => stringFormatToLetters(value), [value])

	return useCallback(async (): Promise<boolean> => {
		if (!required && !valueLetters.length) {
			return true;
		}

		if (valueLetters.length < Const.Form.WorkPosition.MinLetters.Count) {
			onError(Const.Form.WorkPosition.MinLetters.Message);
			return false;
		}

		if (value.length > Const.Form.WorkPosition.MaxLength.Count) {
			onError(Const.Form.WorkPosition.MaxLength.Message);
			return false;
		}

		return true;
	}, [required, valueLetters.length, value.length, onError]);
};
