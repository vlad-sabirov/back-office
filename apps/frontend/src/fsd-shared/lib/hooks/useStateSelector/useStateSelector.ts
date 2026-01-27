import { TypedUseSelectorHook, useSelector } from "react-redux";
import { rootReducer } from "../../../store";

type IStoreState = ReturnType<typeof rootReducer>;
export const useStateSelector: TypedUseSelectorHook<IStoreState> = useSelector;
