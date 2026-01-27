import { useStateActions } from "@fsd/shared/lib/hooks";
import { ReportRealizationSliceActions } from "../../model/report-realization.slice";

export const useActions = () => useStateActions(ReportRealizationSliceActions);
