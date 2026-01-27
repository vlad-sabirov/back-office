import { useStateActions } from "@fsd/shared/lib/hooks";
import { Actions } from "../../model/org-card-info.slice";

export const useActions = () => {
	return useStateActions(Actions);
}
