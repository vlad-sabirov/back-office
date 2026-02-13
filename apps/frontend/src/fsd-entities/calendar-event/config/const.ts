import { EnCalendarEventType } from '../entity';

export const Const = {
	State: {
		ReducerName: 'calendar_event',
	},
	Type: {
		[EnCalendarEventType.Meeting]: { label: 'Встреча', color: 'blue', icon: 'calendar' },
		[EnCalendarEventType.Call]: { label: 'Звонок', color: 'green', icon: 'phone' },
		[EnCalendarEventType.Note]: { label: 'Заметка', color: 'gray', icon: 'note' },
		[EnCalendarEventType.Reminder]: { label: 'Напоминание', color: 'orange', icon: 'bell' },
	},
	Form: {
		Title: {
			MinLength: { Count: 3, Message: 'Минимум 3 символа' },
			MaxLength: { Count: 200, Message: 'Максимум 200 символов' },
			IsRequired: 'Укажите название события',
		},
		Description: {
			MaxLength: { Count: 2000, Message: 'Максимум 2000 символов' },
		},
		DateStart: {
			IsRequired: 'Укажите дату начала',
		},
		DateEnd: {
			IsRequired: 'Укажите дату окончания',
			MustBeAfterStart: 'Дата окончания должна быть позже даты начала',
		},
		Type: {
			IsRequired: 'Укажите тип события',
		},
	},
	Access: {
		Admin: ['admin', 'developer', 'boss', 'crmAdmin'],
		CreateForOthers: ['admin', 'developer', 'boss', 'crmAdmin'],
	},
};
