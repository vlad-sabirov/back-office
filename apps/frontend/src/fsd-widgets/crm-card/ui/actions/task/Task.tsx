import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { CrmTaskService, EnCrmTaskPriority } from '@fsd/entities/crm-task';
import { useCrmHistoryActions } from '@fsd/entities/crm-history';
import { FetchStatusConvert, FetchStatusIsLoading } from '@fsd/shared/lib/fetch-status';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon, Tabs, Textarea, Input, Select, DatePicker } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { ITaskListProps, ITaskPanelProps } from './task.props';
import css from './task.module.scss';

const priorityOptions = [
	{ value: EnCrmTaskPriority.Low, label: 'Низкий' },
	{ value: EnCrmTaskPriority.Normal, label: 'Обычный' },
	{ value: EnCrmTaskPriority.High, label: 'Высокий' },
	{ value: EnCrmTaskPriority.Urgent, label: 'Срочный' },
];

export const TaskPanel: FC<ITaskPanelProps> = ({ index, disabled }) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const currentOrganization = useStateSelector((state) => state.crm_organization.data.current);
	const currentUserRoles = useStateSelector((state) => state.app.auth.roles) || [];
	const { userId, children } = useUserDeprecated();
	const historyActions = useCrmHistoryActions();

	// ID организации
	const organizationId = useMemo(() => {
		return currentOrganization?.id || null;
	}, [currentOrganization]);

	// Менеджер организации (кому назначается задача)
	const assigneeId = useMemo(() => {
		return currentOrganization?.userId || null;
	}, [currentOrganization]);

	// Проверка прав на создание задачи
	// Можно если: ты менеджер организации ИЛИ имеешь роль boss/admin/developer/crmAdmin
	// ИЛИ менеджер организации — твой подчинённый
	const canCreate = useMemo(() => {
		const isManager = currentOrganization?.userId === Number(userId);
		const hasAdminRole = currentUserRoles.some((role: string) =>
			['boss', 'admin', 'developer', 'crmAdmin'].includes(role)
		);
		const isChildManager = children?.includes(currentOrganization?.userId) || false;
		return isManager || hasAdminRole || isChildManager;
	}, [currentOrganization?.userId, userId, currentUserRoles, children]);

	const form = useForm({
		initialValues: {
			title: '',
			description: '',
			priority: EnCrmTaskPriority.Normal,
			deadlineDate: null as Date | null,
			deadlineTime: '18:00',
		},
		validate: {
			title: (value) => (value.trim().length < 3 ? 'Минимум 3 символа' : null),
		},
	});

	// Комбинируем дату и время в один объект Date
	const getDeadlineDateTime = useCallback(() => {
		if (!form.values.deadlineDate) return undefined;
		const date = new Date(form.values.deadlineDate);
		if (form.values.deadlineTime) {
			const [hours, minutes] = form.values.deadlineTime.split(':').map(Number);
			date.setHours(hours, minutes, 0, 0);
		}
		return date;
	}, [form.values.deadlineDate, form.values.deadlineTime]);

	const [create, { ...createProps }] = CrmTaskService.create();

	const onSubmit = useCallback(async () => {
		if (form.validate().hasErrors) return;

		if (!assigneeId) {
			showNotification({ color: 'red', message: 'У организации не назначен менеджер' });
			return;
		}

		await create({
			title: form.values.title,
			description: form.values.description || undefined,
			priority: form.values.priority,
			deadline: getDeadlineDateTime(),
			authorId: userId || 0,
			assigneeId: assigneeId, // Менеджер организации
			organizationId: organizationId || undefined,
		});
		historyActions.reloadTimestamp();
	}, [create, form, userId, assigneeId, organizationId, historyActions, getDeadlineDateTime]);

	useEffect(() => {
		if (createProps.status === 'uninitialized') return;
		const status = FetchStatusConvert(createProps);
		setIsLoading(FetchStatusIsLoading(status));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [createProps.status]);

	useEffect(() => {
		if (createProps.error) {
			const error = createProps.error as any;
			const message = error?.data?.message || error?.message || 'Ошибка создания задачи';
			showNotification({ color: 'red', message });
		}
	}, [createProps.error, createProps.startedTimeStamp]);

	useEffect(() => {
		if (createProps.isSuccess) {
			showNotification({ color: 'green', message: 'Задача создана' });
			form.reset();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [createProps.fulfilledTimeStamp, createProps.isSuccess]);

	// Если нет прав на создание - показать сообщение
	if (!canCreate) {
		return (
			<Tabs.Panel value={index} className={css.panel}>
				<div className={css.noAccess}>
					Вы можете создавать задачи только в своих организациях или организациях ваших подчинённых
				</div>
			</Tabs.Panel>
		);
	}

	return (
		<Tabs.Panel value={index} className={css.panel}>
			<div className={css.taskWrapper}>
				<div className={css.taskRow}>
					<Input
						label="Заголовок задачи"
						placeholder="Введите заголовок"
						className={css.titleInput}
						disabled={disabled || isLoading}
						{...form.getInputProps('title')}
					/>
					<Select
						label="Приоритет"
						data={priorityOptions}
						className={css.prioritySelect}
						disabled={disabled || isLoading}
						{...form.getInputProps('priority')}
					/>
					<DatePicker
						label="Дедлайн"
						placeholder="Выберите дату"
						className={css.deadlineInput}
						disabled={disabled || isLoading}
						minDate={new Date()}
						{...form.getInputProps('deadlineDate')}
					/>
					<Input
						label="Время"
						type="time"
						className={css.timeInput}
						disabled={disabled || isLoading}
						{...form.getInputProps('deadlineTime')}
					/>
				</div>
				<div className={css.taskRow}>
					<Textarea
						label="Описание"
						placeholder="Описание задачи (необязательно)"
						className={css.descriptionInput}
						disabled={disabled || isLoading}
						{...form.getInputProps('description')}
					/>
					<Button
						color="primary"
						size="large"
						className={css.submitButton}
						disabled={disabled || isLoading}
						onClick={onSubmit}
					>
						Создать
					</Button>
				</div>
			</div>
		</Tabs.Panel>
	);
};

export const TaskList: FC<ITaskListProps> = ({ index, disabled }) => {
	return (
		<Tabs.Tab icon={<Icon name="todo" />} value={index} disabled={disabled}>
			Задача
		</Tabs.Tab>
	);
};
