/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import {ActionCreator, ActionCreatorsMapObject, AsyncThunk, bindActionCreators } from "@reduxjs/toolkit";
import { useMemo } from "react";
import { useStateDispatch } from "../useStateDispatch/useStateDispatch";

type BoundActions<T extends ActionCreatorsMapObject> = {
	[key in keyof T]: T[key] extends AsyncThunk<any, any, any>
		? BoundAsyncThunk<T[key]>
		: T[key];
};
type BoundAsyncThunk<T extends ActionCreator<any>> = (...args: Parameters<T>) => ReturnType<ReturnType<T>>;

export const useStateActions =
	<T extends ActionCreatorsMapObject = ActionCreatorsMapObject>
	(actions: T): BoundActions<T> =>
{
	const dispatch = useStateDispatch();
	return useMemo(() => bindActionCreators(actions, dispatch), []);
};
