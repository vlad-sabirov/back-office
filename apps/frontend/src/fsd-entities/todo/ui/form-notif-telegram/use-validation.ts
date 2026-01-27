import { IFormNotifTelegramValidation } from './form-notif-telegram.types';

export const useValidation = () => {
	return (_: IFormNotifTelegramValidation): boolean => {
		return true;
	};
};
