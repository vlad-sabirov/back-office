export const Const = {
	State: {
		ReducerName: 'crm_organization_requisite',
	},
	Form: {
		Name: {
			MinLetters: { Count: 3, Message: 'Минимум 3 буквы' },
			FoundDuplicate: 'Кем-то уже используется',
		},
		Inn: {
			IsRequired: 'Укажите ИНН',
			WrongFormat: { Count: 9, Message: 'Неверный формат' },
			FoundDuplicate: 'Кем-то уже используется',
		},
		Code1C: {
			IsRequired: 'Укажите Код 1С',
			FoundDuplicate: 'Кем-то уже используется',
		},
	},
};
