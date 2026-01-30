import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { parseISO, format } from 'date-fns';
import {
	ICrmTaskEntity,
	EnCrmTaskStatus,
	EnCrmTaskPriority,
	CrmTaskService,
} from '@fsd/entities/crm-task';
import { useCrmHistoryActions } from '@fsd/entities/crm-history';
import { FetchStatusConvert, FetchStatusIsLoading } from '@fsd/shared/lib/fetch-status';
import { Modal, Button, Input, Textarea, Select, DatePicker } from '@fsd/shared/ui-kit';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import css from './task-edit-modal.module.scss';

interface IProps {
	task: ICrmTaskEntity;
	opened: boolean;
	onClose: () => void;
}

const priorityOptions = [
	{ value: EnCrmTaskPriority.Low, label: 'Низкий' },
	{ value: EnCrmTaskPriority.Normal, label: 'Обычный' },
	{ value: EnCrmTaskPriority.High, label: 'Высокий' },
	{ value: EnCrmTaskPriority.Urgent, label: 'Срочный' },
];

const statusOptions = [
	{ value: EnCrmTaskStatus.Pending, label: 'Ожидает' },
	{ value: EnCrmTaskStatus.InProgress, label: 'В работе' },
	{ value: EnCrmTaskStatus.Completed, label: 'Выполнена' },
	{ value: EnCrmTaskStatus.Cancelled, label: 'Отменена' },
];

export const TaskEditModal: FC<IProps> = ({ task, opened, onClose }) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const historyActions = useCrmHistoryActions();

	// Парсим дедлайн на дату и время
	const initialDeadline = useMemo(() => {
		if (!task.deadline) return { date: null, time: '18:00' };
		const date = parseISO(task.deadline);
		return {
			date,
			time: format(date, 'HH:mm'),
		};
	}, [task.deadline]);

	const form = useForm({
		initialValues: {
			title: task.title,
			description: task.description || '',
			priority: task.priority as EnCrmTaskPriority,
			status: task.status as EnCrmTaskStatus,
			deadlineDate: initialDeadline.date as Date | null,
			deadlineTime: initialDeadline.time,
		},
		validate: {
			title: (value) => (value.trim().length < 3 ? 'Минимум 3 символа' : null),
		},
	});

	// Сбросить форму при открытии модала с новыми данными
	useEffect(() => {
		if (opened) {
			form.setValues({
				title: task.title,
				description: task.description || '',
				priority: task.priority as EnCrmTaskPriority,
				status: task.status as EnCrmTaskStatus,
				deadlineDate: initialDeadline.date,
				deadlineTime: initialDeadline.time,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [opened, task.id]);

	// Комбинируем дату и время
	const getDeadlineDateTime = useCallback(() => {
		if (!form.values.deadlineDate) return undefined;
		const date = new Date(form.values.deadlineDate);
		if (form.values.deadlineTime) {
			const [hours, minutes] = form.values.deadlineTime.split(':').map(Number);
			date.setHours(hours, minutes, 0, 0);
		}
		return date;
	}, [form.values.deadlineDate, form.values.deadlineTime]);

	const [update, { ...updateProps }] = CrmTaskService.update();

	const onSubmit = useCallback(async () => {
		if (form.validate().hasErrors) return;

		await update({
			id: task.id,
			data: {
				title: form.values.title,
				description: form.values.description || undefined,
				priority: form.values.priority,
				status: form.values.status,
				deadline: getDeadlineDateTime(),
			},
		});
	}, [update, form, task.id, getDeadlineDateTime]);

	useEffect(() => {
		if (updateProps.status === 'uninitialized') return;
		const status = FetchStatusConvert(updateProps);
		setIsLoading(FetchStatusIsLoading(status));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [updateProps.status]);

	useEffect(() => {
		if (updateProps.error) {
			showNotification({ color: 'red', message: 'Ошибка сохранения задачи' });
		}
	}, [updateProps.error, updateProps.startedTimeStamp]);

	useEffect(() => {
		if (updateProps.isSuccess) {
			showNotification({ color: 'green', message: 'Задача обновлена' });
			historyActions.reloadTimestamp();
			onClose();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [updateProps.fulfilledTimeStamp, updateProps.isSuccess]);

	return (
		<Modal opened={opened} onClose={onClose} title="Редактирование задачи" loading={isLoading}>
			<div className={css.form}>
				<Input
					label="Заголовок задачи"
					placeholder="Введите заголовок"
					disabled={isLoading}
					{...form.getInputProps('title')}
				/>

				<Textarea
					label="Описание"
					placeholder="Описание задачи (необязательно)"
					disabled={isLoading}
					{...form.getInputProps('description')}
				/>

				<div className={css.row}>
					<Select
						label="Статус"
						data={statusOptions}
						disabled={isLoading}
						{...form.getInputProps('status')}
					/>
					<Select
						label="Приоритет"
						data={priorityOptions}
						disabled={isLoading}
						{...form.getInputProps('priority')}
					/>
				</div>

				<div className={css.row}>
					<DatePicker
						label="Дедлайн"
						placeholder="Выберите дату"
						disabled={isLoading}
						minDate={new Date()}
						{...form.getInputProps('deadlineDate')}
					/>
					<Input
						label="Время"
						type="time"
						disabled={isLoading}
						{...form.getInputProps('deadlineTime')}
					/>
				</div>
			</div>

			<Modal.Buttons>
				<Button color="neutral" onClick={onClose} disabled={isLoading}>
					Отмена
				</Button>
				<Button color="primary" onClick={onSubmit} disabled={isLoading}>
					Сохранить
				</Button>
			</Modal.Buttons>
		</Modal>
	);
};
