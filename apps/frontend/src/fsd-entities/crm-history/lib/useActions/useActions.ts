import { useStateActions } from "@fsd/shared/lib/hooks";
import { Actions } from "../../model/slice";

export const useActions = () => {
	return useStateActions(Actions);
}
