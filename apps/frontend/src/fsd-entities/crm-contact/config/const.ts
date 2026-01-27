export const Const = {
	Settings: {
		Power: {
			Medium: 7,
			Low: 21,
			Empty: 45,
		},
		showPower: false,
	},
	State: {
		ReducerName: 'crm_contact',
	},
	localStorage: {
		ListLimit: 'crm_contact_limit',
	},
	Form: {
		Name: {
			MinLetters: { Count: 3, Message: 'Минимум 3 буквы' },
			MaxLength: { Count: 42, Message: 'Максимум 42 символа' }
		},
		WorkPosition: {
			MinLetters: { Count: 3, Message: 'Минимум 3 буквы' },
			MaxLength: { Count: 42, Message: 'Максимум 42 символа' }
		},
		UserId: {
			IsRequired: 'Укажите ответственного',
		},
		Comment: {
			MinLetters: { Count: 12, Message: 'Минимум 12 букв' },
			MaxLength: { Count: 420, Message: 'Максимум 420 символов' }
		},
		Birthday: {
			MinAge: { Count: 16, Message: 'Неверный возраст' },
			MaxAge: { Count: 120, Message: 'Неверный возраст' },
			IsRequired: 'Укажите день рождения',
		},
	},
	Access: {
		Admin: ['admin', 'developer', 'boss', 'crmAdmin'],
		ChangeUserId: ['admin', 'developer', 'boss', 'crmAdmin'],
		MyContacts: ['crm'],
	}
}
