import { useStateActions } from "@fsd/shared/lib/hooks"
import { TagActions } from "../../model/slice/tag.slice";

export const useActions = () => useStateActions(TagActions);
