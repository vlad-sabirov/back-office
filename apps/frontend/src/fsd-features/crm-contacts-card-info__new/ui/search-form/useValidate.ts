import { useCallback } from "react";
import { useStateSelector } from "@fsd/shared/lib/hooks";
import { Const } from "../../config/const";
import { ISearchFormValidate } from "./search-form.types";

export const useValidate = (props: ISearchFormValidate) => {
	const { setErrorName } = props;
	const formName = useStateSelector((state) => state.crm_contact_card_info.forms.search.name);

	return useCallback(async (): Promise<boolean> => {
		if (formName.length !== 0 && formName.length < Const.Form.Search.Name.MinLength.Count) {
			setErrorName(Const.Form.Search.Name.MinLength.Message);
			return false;
		}

		return true;
	}, [formName.length, setErrorName]);
}
