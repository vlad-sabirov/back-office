export const isBiggerMinDate = (
	{ selfDate, minDate }: { selfDate: Date, minDate: Date }
): boolean => {
	return selfDate.getTime() > minDate.getTime();
}
