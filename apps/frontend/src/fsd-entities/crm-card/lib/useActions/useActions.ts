import { useStateActions } from "@fsd/shared/lib/hooks"
import { CrmCardActions } from "../.."

export const useActions = () => useStateActions(CrmCardActions);
