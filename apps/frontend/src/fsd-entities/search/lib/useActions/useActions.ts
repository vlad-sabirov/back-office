import { useStateActions } from "@fsd/shared/lib/hooks"
import { SearchActions } from "../.."

export const useActions = () => useStateActions(SearchActions);
