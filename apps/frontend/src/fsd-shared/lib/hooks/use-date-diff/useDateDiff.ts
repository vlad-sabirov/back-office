import { differenceInSeconds, format } from "date-fns";
import { useCallback } from "react";

export const useDateDiff = () => {
	const dateDiffToTime = useCallback((date: Date) => {
		const diff = differenceInSeconds(new Date(), date);
		const hours = Math.floor(diff / 3600);
		const minutes = Math.floor((diff % 3600) / 60);
		const remainingSeconds = diff % 60;
		const formattedTime = format(new Date().setHours(hours, minutes, remainingSeconds), 'HH:mm:ss');
		return hours > 0 ? formattedTime : formattedTime.slice(3);
	}, []);

	return {
		dateDiffToTime,
	};
}
