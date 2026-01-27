import { useStateSelector } from "@fsd/shared/lib/hooks";
import { Const } from "../../../../config/const";
import { useActions } from "../../../../lib/use-actions";

export const useValidate = () => {
	const formUserId = useStateSelector((state) => state.crm_organization_card_info.forms.changeUserId.userId);
	const actions = useActions();

	return async () => {
		if (!formUserId) {
			actions.setErrorChangeUserId({ userId: Const.Validation.ChangeUserId.UserIdNotFound });
			return false;
		}

		return true;
	}
}
