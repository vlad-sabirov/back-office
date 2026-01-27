import { isEmail } from "./validator";

type ResponseT = {
	valid: boolean;
	input: string;
	clear: string;
	domain: string;
}

export const parseEmail = (value: string): ResponseT => {
	const clearValue = value.replace(/ /g,'');
	return {
		valid: isEmail(clearValue),
		input: value,
		clear: clearValue,
		domain: clearValue.split('@')[1]
	}
}
