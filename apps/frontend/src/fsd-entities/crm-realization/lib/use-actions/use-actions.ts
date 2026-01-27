import { useStateActions } from "@fsd/shared/lib/hooks";
import { RealizationSliceActions } from "../../model/realization.slice";

export const useActions = () => useStateActions(RealizationSliceActions);
