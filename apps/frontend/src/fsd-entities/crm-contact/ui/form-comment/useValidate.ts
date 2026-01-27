import { stringFormatToLetters } from "@fsd/shared/lib/string-format";
import { useCallback, useMemo } from "react";
import { Const } from "../../config/const";
import { IFormCommentProps } from "./form-comment.types";

export const useValidate = (props: IFormCommentProps) => {
	const { value, required, onError } = props;
	const valueLetters = useMemo(() => stringFormatToLetters(value), [value]);

	return useCallback(async (): Promise<boolean> => {
		if (!required && !valueLetters.length) {
			return true;
		}

		if (valueLetters.length < Const.Form.Comment.MinLetters.Count) {
			onError(Const.Form.Comment.MinLetters.Message);
			return false;
		}

		if (value.length > Const.Form.Comment.MaxLength.Count) {
			onError(Const.Form.Comment.MaxLength.Message);
			return false;
		}

		return true;
	}, [required, valueLetters.length, value.length, onError]);
};
