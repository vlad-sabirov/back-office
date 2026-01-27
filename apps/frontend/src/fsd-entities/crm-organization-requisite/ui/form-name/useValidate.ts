import { useCallback, useMemo } from "react";
import { stringFormatToLetters } from "@helpers";
import { CrmOrganizationRequisiteService } from "@fsd/entities/crm-organization-requisite";
import { Const } from "../../config/const";
import { IFormNameProps } from "./form-name.types";

export const useValidate = (props: IFormNameProps) => {
	const { value, data, required, ignoreData, onError } = props;
	const valueLetters = useMemo(() => stringFormatToLetters(value), [value]);
	const [findOnce] = CrmOrganizationRequisiteService.findOnce();

	return useCallback(async (): Promise<boolean> => {
		if (!required && !valueLetters.length) {
			return true;
		}

		if (valueLetters.length < Const.Form.Name.MinLetters.Count) {
			onError(Const.Form.Name.MinLetters.Message);
			return false;
		}

		if (ignoreData && ignoreData?.some((item) => item.name === value.trim())) {
			return true;
		}

		if (data?.some((item) => item.name === value.trim())) {
			onError(Const.Form.Name.FoundDuplicate);
			return false;
		}

		const findDuplicate = await findOnce({ where: { name: value.trim() } });
		if ('data' in findDuplicate && findDuplicate.data) {
			onError(Const.Form.Name.FoundDuplicate);
			return false;
		}

		return true;
	}, [required, valueLetters.length, ignoreData, data, findOnce, value, onError]);
};
