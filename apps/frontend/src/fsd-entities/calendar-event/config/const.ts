import { EnCalendarEventType, EnCalendarEventStatus } from '../entity';

export const Const = {
	State: {
		ReducerName: 'calendar_event',
	},
	Type: {
		[EnCalendarEventType.Meeting]: { label: 'Встреча', color: 'blue', icon: 'calendar', hex: '#42a5f5', bg: '#e3f2fd' },
		[EnCalendarEventType.Call]: { label: 'Звонок', color: 'green', icon: 'phone', hex: '#66bb6a', bg: '#e8f5e9' },
		[EnCalendarEventType.Note]: { label: 'Заметка', color: 'grape', icon: 'note', hex: '#ab47bc', bg: '#f3e5f5' },
		[EnCalendarEventType.Reminder]: { label: 'Напоминание', color: 'orange', icon: 'bell', hex: '#ffa726', bg: '#fff3e0' },
	},
	Status: {
		[EnCalendarEventStatus.Active]: { label: 'Активное', color: 'blue', hex: '#4f7ff0' },
		[EnCalendarEventStatus.Completed]: { label: 'Выполнено', color: 'green', hex: '#66bb6a' },
		[EnCalendarEventStatus.Cancelled]: { label: 'Отменено', color: 'gray', hex: '#96a2b6' },
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
