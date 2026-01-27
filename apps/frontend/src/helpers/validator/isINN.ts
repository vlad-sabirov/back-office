export const isINN = (value: string): boolean => {
	const pattern = new RegExp('^[0-9]{9}');
	return pattern.test(value);
}
