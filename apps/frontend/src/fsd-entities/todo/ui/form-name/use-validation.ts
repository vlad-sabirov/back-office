import { Validation } from '@fsd/entities/todo/config/validation';
import { IFormNameValidation } from '@fsd/entities/todo/ui/form-name/form-name.types';

export const useValidation = () => {
	return (opts: IFormNameValidation): boolean => {
		const { value, setError, required } = opts;

		if (required && !value) {
			setError('Название задачи не может быть пустым');
			return false;
		}

		if (value.length < Validation.MinLengthName) {
			setError(`Не менее ${Validation.MinLengthName} символов`);
			return false;
		}

		if (value.length > Validation.MaxLengthName) {
			setError(`Не более ${Validation.MaxLengthName} символов`);
			return false;
		}

		return true;
	};
};
