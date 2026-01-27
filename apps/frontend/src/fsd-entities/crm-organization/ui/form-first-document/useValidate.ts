import { useCallback } from "react";
import { CrmOrganizationConst as Const } from "../../config/const";
import { IFormFirstDocumentProps } from "./form-first-document.types";

export const useValidate = (props: IFormFirstDocumentProps) => {
	const { value, required, onError } = props;

	return useCallback(async (): Promise<boolean> => {
		if (!required) { return true; }

		if (value.length < Const.Form.FirstDocument.MinLetters.Count) {
			onError(Const.Form.FirstDocument.MinLetters.Message);
			return false;
		}

		if (value.length > Const.Form.FirstDocument.MaxLength.Count) {
			onError(Const.Form.FirstDocument.MaxLength.Message);
			return false;
		}

		return true;
	}, [required, value, onError]);
};
