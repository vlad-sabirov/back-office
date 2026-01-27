import { useStateActions } from "@fsd/shared/lib/hooks"
import { RequisiteActions } from "../../model/slice/requisite.slice";

export const useActions = () => useStateActions(RequisiteActions);
