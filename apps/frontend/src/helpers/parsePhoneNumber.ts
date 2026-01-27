import { parsePhoneNumber as awesomePhoneNumber } from "awesome-phonenumber";

type PropsT = {
	mask?: string;
	maskChar?: string;
	maskLength?: [number, number];
}

type ResponseT = {
	valid: boolean;
	input: string;
	output: string;
	clear: string;
	isMobile: boolean;
	isFixedLine: boolean;
	isVoip: boolean;
}

export const parsePhoneNumber = (value: string | number, props?: PropsT): ResponseT => {
	const valueToString = typeof value === 'number' ? String(value) : value;
	const phone = valueToString.replace(/\D/g, '');
	const mask = props?.mask || '+998(##)###-##-##';
	const maskChar = props?.maskChar || '#';
	const maskMinLength = props?.maskLength?.[0] || 9;
	const maskMaxLength = props?.maskLength?.[1] || 12;

	if (phone.length < maskMinLength || phone.length > maskMaxLength) {
		return {
			input: valueToString,
			valid: phone.length === 3,
			output: phone,
			clear: phone,
			isMobile: false,
			isFixedLine: false,
			isVoip: phone.length === 3,
		};
	}

	let result = '';
	let index = 0;
	const maskLength = mask.split('').filter((char) => char === maskChar).length;
	const phoneSlice = phone.slice(-Math.abs(maskLength));
	const awesome = awesomePhoneNumber(phone, { regionCode: 'UZ' });

	for (let i = 0; i < mask.length; i += 1) {
		if (mask[i] === maskChar) {
			result += phoneSlice[index] || '';
			index += 1;
		} else {
			result += mask[i];
		}
	}
	return {
		valid: awesome.valid,
		input: valueToString,
		output: result,
		clear: result.replace(/\D/g, '').slice(-Math.abs(maskLength)),
		isMobile: awesome.typeIsMobile ?? false,
		isFixedLine: awesome.typeIsFixedLine ?? false,
		isVoip: false,
	}
}
