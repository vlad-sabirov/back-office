import { MutableRefObject, useLayoutEffect, useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const useLatest = <T extends unknown> (current: T): MutableRefObject<T> => {
	const ref = useRef(current);
	useLayoutEffect(() => { ref.current = current; }, [current]);
	return ref;
}
