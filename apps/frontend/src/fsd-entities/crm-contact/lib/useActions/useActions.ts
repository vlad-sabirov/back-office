import { useStateActions } from "@fsd/shared/lib/hooks";
import { CrmContactActions } from "../../model/slice";

export const useActions = () => {
	return useStateActions(CrmContactActions);
}
