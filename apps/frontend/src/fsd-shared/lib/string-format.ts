import { trim } from 'lodash';

export const stringFormatToLetters = (val: string | undefined): string =>
	val ? trim(val.replace(/[^a-zA-Zа-яА-Я]/g, '')) : '';
