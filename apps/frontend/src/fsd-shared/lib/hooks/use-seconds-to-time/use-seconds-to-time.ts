import { format } from 'date-fns';

export const useSecondsToTime = (seconds: number): string => {
	return format(seconds * 1000, 'mm:ss');
};
