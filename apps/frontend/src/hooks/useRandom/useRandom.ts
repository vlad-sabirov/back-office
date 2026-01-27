/**
 * Хук для возвращения случайного числа в диапазоне от и до
 * После инициализации объекта, нужно воспользоваться методом calc()
 *
 * Примеры использования:
 * const random = useRandom()
 * random.calc(747) - Выведем случайное число от 0 до 747
 * random.calc(42, 747) - Выведем случайное число от 42 до 747
 */
export const useRandom = () => {
	const calc = (numberOne: number, numberTwo?: number): number =>
		Math.round(Math.random() * Math.abs(numberOne - (numberTwo || 0))) + Math.min(numberOne, numberTwo || 0);

	return { calc };
};
