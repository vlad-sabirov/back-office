import { IFromTagsProps } from "./form-tags.types";
import { Const } from "../../config/const";
import { useCallback } from "react";

export const useValidate = (props: IFromTagsProps) => {
	const { value, required, onError } = props;

	return useCallback(async (): Promise<boolean> => {
		onError('');
		if (!required && !value?.length) { return true; }

		if (required && !value?.length) {
			onError(Const.Form.Select.IsRequired);
			return false;
		}

		return true;
	}, [required, value, onError]);
};
