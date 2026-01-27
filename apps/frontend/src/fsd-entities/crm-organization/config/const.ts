export const CrmOrganizationConst = {
	Settings: {
		Power: {
			Medium: 30,
			Low: 60,
			Empty: 90,
		},
		showPower: true,
	},
	State: {
		ReducerName: 'crm_organization',
	},
	localStorage: {
		ListLimit: 'crm_organization_limit',
	},
	Access: {
		Admin: ['developer', 'boss', 'crmAdmin'],
		MyOrganization: ['crm'],
		AddOrganization: ['crm', 'crmAdmin', 'boss', 'developer'],
	},
	Form: {
		Name: {
			MinLetters: { Count: 3, Message: 'Минимум 3 буквы' },
			MaxLength: { Count: 77, Message: 'Слишком длинное название' },
		},
		FirstDocument: {
			MinLetters: { Count: 3, Message: 'Минимум 3 символа' },
			MaxLength: { Count: 42, Message: 'Максимум 42 символа' },
		},
		UserId: {
			IsRequired: 'Укажите ответственного',
		},
		Website: {
			IsRequired: 'Укажите вебсайт',
			WrongFormat: 'Неверный формат',
		},
		Comment: {
			MinLetters: { Count: 3, Message: 'Минимум 3 буквы' },
			MaxLength: { Count: 420, Message: 'Максимум 420 символов' },
		},
	},
};
