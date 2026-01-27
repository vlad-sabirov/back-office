import { useCallback } from "react";
import { CrmOrganizationConst as Const } from "../../config/const";
import { IFormUserIdProps } from "./form-user-id.types";

export const useValidate = (props: IFormUserIdProps) => {
	const { value, required, onError } = props;

	return useCallback(async (): Promise<boolean> => {
		if (!value && required) {
			onError(Const.Form.UserId.IsRequired);
			return false;
		}

		return true;
	}, [required, value, onError]);
};
