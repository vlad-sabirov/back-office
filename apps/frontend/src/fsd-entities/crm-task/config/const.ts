import { EnCrmTaskStatus, EnCrmTaskPriority } from '../entity';

export const Const = {
	State: {
		ReducerName: 'crm_task',
	},
	localStorage: {
		ListLimit: 'crm_task_limit',
	},
	Status: {
		[EnCrmTaskStatus.Pending]: { label: 'Ожидает', color: 'gray' },
		[EnCrmTaskStatus.InProgress]: { label: 'В работе', color: 'blue' },
		[EnCrmTaskStatus.Completed]: { label: 'Выполнена', color: 'green' },
		[EnCrmTaskStatus.Cancelled]: { label: 'Отменена', color: 'red' },
	},
	Priority: {
		[EnCrmTaskPriority.Low]: { label: 'Низкий', color: 'gray' },
		[EnCrmTaskPriority.Normal]: { label: 'Обычный', color: 'blue' },
		[EnCrmTaskPriority.High]: { label: 'Высокий', color: 'orange' },
		[EnCrmTaskPriority.Urgent]: { label: 'Срочный', color: 'red' },
	},
	Form: {
		Title: {
			MinLength: { Count: 3, Message: 'Минимум 3 символа' },
			MaxLength: { Count: 200, Message: 'Максимум 200 символов' },
			IsRequired: 'Укажите заголовок задачи',
		},
		Description: {
			MaxLength: { Count: 2000, Message: 'Максимум 2000 символов' },
		},
		AssigneeId: {
			IsRequired: 'Укажите исполнителя',
		},
	},
	Access: {
		Admin: ['admin', 'developer', 'boss', 'crmAdmin'],
		CreateForOthers: ['admin', 'developer', 'boss', 'crmAdmin'],
	},
};
