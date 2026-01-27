export const delay = (milliSeconds: number | string): Promise<void> => {
	return new Promise(resolve => {
		return setTimeout(resolve, Number(milliSeconds));
	});
}
