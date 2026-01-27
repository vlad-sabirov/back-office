import { useStateActions } from "@fsd/shared/lib/hooks";
import { AppActions } from "../../model/app.slice";

export const useActions = () => {
	return useStateActions(AppActions);
}
