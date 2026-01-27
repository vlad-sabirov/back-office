import { useEffect, useState } from 'react';
import { differenceInSeconds, parseISO } from 'date-fns';

export const useTimer = (timestamp: string | null): string => {
	const [timer, setTimer] = useState<string>('');

	useEffect(() => {
		if (!timestamp) {
			return;
		}
		setTimeout(() => {
			const diff = differenceInSeconds(new Date(), parseISO(timestamp));
			const minutes = Math.floor(diff / 60);
			const seconds = diff % 60;

			const formattedDifference = `${minutes}:${seconds.toString().padStart(2, '0')}`;
			setTimer(String(formattedDifference));
		}, 1000);
	}, [timestamp, timer]);

	useEffect(() => {
		if (!timestamp) {
			return;
		}
		const diff = differenceInSeconds(new Date(), parseISO(timestamp));
		const minutes = Math.floor(diff / 60);
		const seconds = diff % 60;

		const formattedDifference = `${minutes}:${seconds.toString().padStart(2, '0')}`;
		setTimer(String(formattedDifference));
	}, [timestamp]);

	if (!timestamp) {
		return '';
	}

	return timer;
};
