import { useCallback } from "react";
import { HelperValidate } from "@fsd/shared/lib/validate";
import { CrmOrganizationConst as Const } from "../../config/const";
import { IFormWebsiteProps } from "./form-website.types";

export const useValidate = (props: IFormWebsiteProps) => {
	const { value, required, onError } = props;

	return useCallback(async (): Promise<boolean> => {
		if (!required && !value.length) {
			return true;
		}

		if (required && !value.length) {
			onError(Const.Form.Website.IsRequired);
			return false;
		}

		if (!HelperValidate.isWebsite(value)) {
			onError(Const.Form.Website.WrongFormat);
			return false;
		}


		return true;
	}, [required, value, onError]);
};
