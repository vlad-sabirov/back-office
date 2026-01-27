/* eslint-disable no-useless-escape, max-len */
// noinspection RegExpRedundantEscape,RegExpSimplifiable

export class HelperValidate {
	static isEmail = (value: string): boolean => {
		// eslint-disable-next-line max-len
		const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(value).toLowerCase());
	}

	static isWebsite = (value: string): boolean => {
		const re = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9]+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,5})(:[0-9]{1,5})?(\/.*)?$/;
		return re.test(String(value).toLowerCase());
	}

	static isEmptyObject = (value: Record<string, unknown>): boolean => {
		const filteredValues = Object.values(value).filter((item) => {
				if (typeof item === 'string') { return item.trim() !== ''; }
				return !!item;
			}
		);
		return filteredValues.length === 0;
	};
}
