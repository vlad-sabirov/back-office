export const getPercent = (current: number | undefined, diff: number | undefined): number => {
	if (!current || !diff) {
		return 0;
	}
	return Math.round((current / diff) * 100) - 100;
};
