export const StaffUserRegistrationConstants = {
	VALIDATE_FIRST_NAME_WRONG_LENGTH: 'Поле имени должно содержать от 2 до 64 символов',
	VALIDATE_LAST_NAME_WRONG_LENGTH: 'Поле фамилии должно содержать от 2 до 64 символов',
	VALIDATE_SURNAME_WRONG_LENGTH: 'Поле отчества должно содержать от 4 до 64 символов',
	VALIDATE_BIRTHDAY_NOT_FILLED: 'Укажите дату рождения',
	VALIDATE_USERNAME_WRONG_LENGTH: 'Поле логина должно содержать от 4 до 32 символов',
	VALIDATE_USERNAME_DUPLICATE: {
		response: 'Пользователь с таким полем username не найден',
		output: 'Пользователь с таким логином уже зарегистрирован в системе',
	},
	VALIDATE_PASSWORD_WRONG_LENGTH: 'Поле пароля должно содержать от 8 до 64 символов',
	VALIDATE_PASSWORD_DO_NOT_MATCH: 'Пароли не совпадают',
	VALIDATE_WORK_POSITION_NOT_FILLED: 'Укажите должность',
	VALIDATE_PHONE_NOT_FILLED: 'Неверный формат номера',
	VALIDATE_VOIP_DUPLICATE: 'Номер занят',
	VALIDATE_EMAIL: 'Неверный формат почтового ящика',
	VALIDATE_TERRITORY: 'Укажите территорию',
	VALIDATE_DEPARTMENT: 'Укажите отдел',
};
