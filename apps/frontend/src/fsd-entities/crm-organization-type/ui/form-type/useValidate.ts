import { useCallback } from "react";
import { CrmOrganizationTypeConst as Const } from "../../const/crm-organization-type.const";
import { IFormTypeProps } from "./form-type.types";

export const useValidate = (props: IFormTypeProps) => {
	const { value, required, onError } = props;

	return useCallback(async (): Promise<boolean> => {
		if (!value && required) {
			onError(Const.Form.IsRequired);
			return false;
		}

		return true;
	}, [required, value, onError]);
}
