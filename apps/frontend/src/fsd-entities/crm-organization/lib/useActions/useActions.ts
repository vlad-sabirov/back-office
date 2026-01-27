import { useStateActions } from "@fsd/shared/lib/hooks";
import { CrmOrganizationActions } from "../../model/slice";

export const useActions = () => {
	return useStateActions(CrmOrganizationActions);
}
