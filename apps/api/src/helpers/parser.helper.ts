import { parseISO } from 'date-fns';
import * as _ from 'lodash';
import { CombiningType } from 'src/helpers';
import { parsePhoneNumber } from "awesome-phonenumber";

type numberString = (number | string) | (number | string)[];

export class ParserHelper {
	static async toNumber(value: numberString): Promise<number>;
	static async toNumber(value: CombiningType<numberString>): Promise<CombiningType<number>>;
	static async toNumber(value: CombiningType<numberString> | numberString) {		
		if (_.isArray(value)) {
			return value.map((item) => Number(item));
		}
		
		if (_.isObject(value)) {
			const keys = _.keys(value);
			const values = _.values(value);
			const result = {};
			
			for (let i = 0; i < keys.length; i++) {
				result[keys[i]] = await this.toNumber(values[i]);
			}
			return result;
		}
		
		return Number(value);
	}

	static async stringToDate(value: string): Promise<Date>;
	static async stringToDate(value: Date): Promise<Date>;
	static async stringToDate(value: CombiningType<string>): Promise<CombiningType<Date>>;
	static async stringToDate(value: CombiningType<Date>): Promise<CombiningType<Date>>;
	static async stringToDate(
		value: string | Date | CombiningType<string> | CombiningType<Date>
	): Promise<Date | CombiningType<Date>> {
		if (_.isDate(value)) return value;
		return _.isObject(value) ? _.mapValues(value, (item) => (_.isDate(item) ? item : parseISO(item))) : parseISO(value);
	}

	static async toPhone(value: numberString): Promise<number>;
	static async toPhone(value: CombiningType<numberString>): Promise<CombiningType<number>>;
	static async toPhone(value: CombiningType<numberString> | numberString) {
		if (_.isArray(value)) {
			return value.map((item) => {
				const awesome = parsePhoneNumber(String(item), { regionCode: 'UZ' });
				return Number(awesome.number.input.replace(/\D/g, '')).toString().slice(-9);
			});
		}

		if (_.isObject(value)) {
			const keys = _.keys(value);
			const values = _.values(value);
			const result = {};

			for (let i = 0; i < keys.length; i++) {
				result[keys[i]] = await this.toNumber(values[i]);
			}
			return result;
		}

		const awesome = parsePhoneNumber(String(value), { regionCode: 'UZ' });
		return Number(awesome.number.input.replace(/\D/g, '')).toString().slice(-9);
	}
}
