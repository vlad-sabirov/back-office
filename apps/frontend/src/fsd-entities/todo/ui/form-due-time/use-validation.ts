import { IFormNameValidation } from '@fsd/entities/todo/ui/form-name/form-name.types';

export const useValidation = () => {
	return (_: IFormNameValidation): boolean => {
		return true;
	};
};
