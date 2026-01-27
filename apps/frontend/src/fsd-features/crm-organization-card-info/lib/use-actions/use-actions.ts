import { useStateActions } from "@fsd/shared/lib/hooks";
import { OrgCardInfoActions } from "../../model/slice/org-card-info.slice";

export const useActions = () => useStateActions(OrgCardInfoActions);
