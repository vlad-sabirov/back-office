import { IFormDescriptionValidation } from './form-description.types';

export const useValidation = () => {
	return (opts: IFormDescriptionValidation): boolean => {
		const { value, setError } = opts;

		if (value.length > 0 && value.length < 3) {
			setError('Минимальная длина 3 символа');
			return false;
		}

		return true;
	};
};
