export const CalendarEventConstants = {
	NOT_FOUND: 'Событие не найдено',
	VALIDATION_TITLE_LENGTH: 'Название события должно содержать минимум 3 символа',
	VALIDATION_DATE_RANGE: 'Дата окончания должна быть позже даты начала',
	VALIDATION_TYPE: 'Недопустимый тип события. Допустимые значения: meeting, call, note, reminder',
	FORBIDDEN_NOT_AUTHOR: 'Вы можете редактировать или удалять только свои события',
	FORBIDDEN_NOT_ASSIGNEE: 'У вас нет доступа к этому календарю',
	FORBIDDEN_CANNOT_CREATE_FOR_USER: 'Вы не можете создавать события для этого сотрудника',
	VALIDATION_STATUS: 'Недопустимый статус события. Допустимые значения: active, completed, cancelled',
	ALREADY_COMPLETED: 'Событие уже завершено или отменено',
};

export const CalendarEventTypes = ['meeting', 'call', 'note', 'reminder'] as const;
export const CalendarEventStatuses = ['active', 'completed', 'cancelled'] as const;

export const CalendarEventTypeLabels: Record<string, string> = {
	meeting: 'Встреча',
	call: 'Звонок',
	note: 'Заметка',
	reminder: 'Напоминание',
};

export const CalendarEventStatusLabels: Record<string, string> = {
	active: 'Активное',
	completed: 'Выполнено',
	cancelled: 'Отменено',
};
