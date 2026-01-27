import { IFormDueDateValidation } from './form-due-date.types';

export const useValidation = () => {
	return (opts: IFormDueDateValidation): boolean => {
		const { value, setError, required } = opts;

		if (required && value === '') {
			setError('Укажите дату');
			return false;
		}

		return true;
	};
};
