import { useDispatch } from "react-redux";
import { ReduxStore } from "../../../store";

export type IUseStateDispatch = ReturnType<typeof ReduxStore>['dispatch']
export const useStateDispatch = () => useDispatch<IUseStateDispatch>();
