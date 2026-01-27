import { IFormOrgOrContValidation } from './form-org-or-cont.types';

export const useValidation = () => {
	return (_: IFormOrgOrContValidation): boolean => {
		return true;
	};
};
