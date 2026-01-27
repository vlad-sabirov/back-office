/**
 *
 * @param number Какое-то число
 * @param suffix ['час', 'часа', 'часов']
 * @param displayNumber Выводить цифру или нет
 */
export const SuffixFormat = (number: number, suffix: string[], displayNumber?: boolean): string => {
	const displayValue = displayNumber ? `${number} ` : '';
	// Час, день
	if (number == 1 || (number > 20 && number % 10 == 1)) return displayValue + suffix[0];
	// Часа, дней
	else if ((number > 21 && number % 10 > 1 && number % 10 < 5) || (number > 1 && number < 5))
		return displayValue + suffix[1];
	// Часов, дней
	else return displayValue + suffix[2];
};
