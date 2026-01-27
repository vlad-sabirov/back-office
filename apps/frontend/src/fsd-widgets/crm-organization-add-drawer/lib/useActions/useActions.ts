import { useStateActions } from "@fsd/shared/lib/hooks";
import { orgAddActions } from "../../model/slice/org-add.slice";

export const useActions = () => useStateActions(orgAddActions);
