import { throttle } from "lodash";
import { useEffect, useMemo } from "react";
import { useLatest } from "../useLatest/useLatest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useThrottling = (cb: (...args: any) => void, delay: number) => {
	const cbRef = useLatest(cb);
	const debounceFn =  useMemo(() => throttle((...args) => {
		cbRef.current(...args);
	}, delay), [cbRef, delay]);
	useEffect(() => () => debounceFn.cancel(), [debounceFn]);
	return debounceFn;
}
