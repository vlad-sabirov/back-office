import { IFormAssigneeValidation } from './form-assignee.types';

export const useValidation = () => {
	return (_: IFormAssigneeValidation): boolean => {
		return true;
	};
};
