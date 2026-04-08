export const URL_CRM = `http://${process.env.API_CONTAINER_NAME || 'api'}:3000`;
export const URL_1C = process.env.ACCOUNT_1C_HOST;

export const CONFIG_1C = {
	AUTH: {
		USERNAME: process.env.ACCOUNT_1C_AUTH_LOGIN,
		PASSWORD: process.env.ACCOUNT_1C_AUTH_PASSWORD,
	},
};

export const BUILD_MONTH_REPORT_BY_DATE_EXCEPTIONS = {
	NOT_FOUND: 'В системе не обнаружены планы на указанную дату',
	USERS_ERROR: 'Ошибка при получении списка пользователей',
};

export const FIND_MONTH_REPORT_ALL_BY_USER_ID = {
	NOT_FOUND: 'В системе нет отчетов по указанному сотруднику',
};
