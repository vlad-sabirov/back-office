import { INum, IOptions } from './interfaces';
import cn from 'classnames';
import css from './styles.module.scss';

/**
 * Функция предназначенная для форматирования чисел
 * и отображения их с разделителями в виде пробелов
 *
 * NumberFormat(num: string, options: {})
 *
 * Опции:
 * before, after: string - надпись до или после числа
 * operator: boolean - добавлять или нет + положительному значению
 * sup: boolean - заключать ли значение в тег <sup></sup>
 * locale: string - локаль для преобразования числа в строку
 */
export const NumberFormat = (num: INum, options?: IOptions): JSX.Element | string => {
	const { before, after, operator, locale, sup } = options || {};
	if (!num) return <>{sup ? '' : '0'}</>;
	num = options?.round ? Math.round(Number(num)) : Number(num);
	let result = '';

	// Формирование результата
	if (before) result += before;
	if (operator && num > 0) result += '+';
	if (operator && num < 0) result += '-';
	result += Math.abs(num).toLocaleString(locale || 'ru', {
		style: 'decimal',
		useGrouping: true,
		minimumFractionDigits: 0,
	});
	if (after) result += after;

	if (sup) {
		return (
			<sup
				className={cn(css.sup, {
					[css.green]: num > 0,
					[css.red]: num < 0,
				})}
			>
				{result}
			</sup>
		);
	}

	return result;
};

export const NumberFormatAbbreviations = (value: number): string => {
	if (value >= 1000000000) {
		return `${Math.floor(value / 100000000) / 10} млрд`;
	}
	if (value >= 1000000) {
		return `${Math.floor(value / 100000) / 10} млн`;
	}
	if (value >= 1000) {
		return `${Math.floor(value / 100) / 10} тыс`;
	}
	return `${value}`;
};
