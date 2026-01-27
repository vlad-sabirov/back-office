import { trim } from "lodash";

export const stringFormatToLetters = (val: string): string => 
	trim(val.replace(/[^a-zA-Zа-яА-Я]/g, ''));
