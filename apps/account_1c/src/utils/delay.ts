export const delay = async (t: number): Promise<void> => {
	return new Promise((res) => setTimeout(res, t));
};
