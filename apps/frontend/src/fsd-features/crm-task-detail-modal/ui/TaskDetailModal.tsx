import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Modal, Stack, Group, Badge, Text, Paper, Button, Select, TextInput, Textarea } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { showNotification } from '@mantine/notifications';
import { ICrmTaskEntity, CrmTaskConst, CrmTaskService, EnCrmTaskPriority } from '@fsd/entities/crm-task';
import { useAccess, useUserDeprecated, useRoles } from '@hooks';
import { ROLE_HIERARCHY } from '@fsd/shared/lib/role-hierarchy';

const allTaskStatusOptions = Object.entries(CrmTaskConst.Status).map(([value, config]) => ({
	value,
	label: config.label,
}));

const assigneeAllowedStatuses = [
	{ value: 'in_progress', label: CrmTaskConst.Status['in_progress' as keyof typeof CrmTaskConst.Status]?.label || 'В работе' },
	{ value: 'completed', label: CrmTaskConst.Status['completed' as keyof typeof CrmTaskConst.Status]?.label || 'Выполнена' },
];

// Текущий статус всегда виден + доступные для смены
const getAssigneeTaskStatusOptions = (currentStatus: string) => {
	const allowed = [...assigneeAllowedStatuses];
	if (currentStatus === 'pending' || currentStatus === 'cancelled') {
		const currentOption = allTaskStatusOptions.find((o) => o.value === currentStatus);
		if (currentOption) {
			allowed.unshift({ ...currentOption, disabled: true } as any);
		}
	}
	return allowed;
};

const taskPriorityOptions = Object.entries(CrmTaskConst.Priority).map(([value, config]) => ({
	value,
	label: config.label,
}));

interface TaskDetailModalProps {
	task: ICrmTaskEntity | null;
	opened: boolean;
	onClose: () => void;
	onUpdated?: () => void;
	onDeleted?: () => void;
	defaultEditing?: boolean;
}

const btnPrimary = {
	backgroundColor: '#228be6',
	color: '#fff',
	border: 'none',
	transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
} as const;

const handleBtnEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
	e.currentTarget.style.backgroundColor = '#1565c0';
	e.currentTarget.style.boxShadow = '0 2px 8px rgba(21, 101, 192, 0.4)';
};

const handleBtnLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
	e.currentTarget.style.backgroundColor = '#228be6';
	e.currentTarget.style.boxShadow = 'none';
};

export const TaskDetailModal: FC<TaskDetailModalProps> = ({ task, opened, onClose, onUpdated, onDeleted, defaultEditing }) => {
	const router = useRouter();
	const { userId } = useUserDeprecated();
	const CheckAccess = useAccess();
	const currentRoles = useRoles();
	const isBoss = CheckAccess(['developer', 'boss', 'crmAdmin', 'admin']);
	const [updateTaskStatus] = CrmTaskService.updateStatus();
	const [updateTask] = CrmTaskService.update();
	const [deleteTask] = CrmTaskService.delete();

	const [confirmDelete, setConfirmDelete] = useState(false);
	const [editing, setEditing] = useState(false);
	const [localTask, setLocalTask] = useState<ICrmTaskEntity | null>(null);
	const [editForm, setEditForm] = useState({ title: '', description: '', priority: '', status: '', deadlineDate: null as Date | null, deadlineTime: '18:00' });

	useEffect(() => {
		// Не открывать редактирование для отменённых/выполненных задач
		if (opened && defaultEditing && task && task.status !== 'cancelled' && task.status !== 'completed') {
			const deadline = task.deadline ? new Date(task.deadline) : null;
			setEditForm({
				title: task.title,
				description: task.description || '',
				priority: task.priority,
				status: task.status,
				deadlineDate: deadline,
				deadlineTime: deadline ? format(deadline, 'HH:mm') : '18:00',
			});
			setEditing(true);
		}
	}, [opened, defaultEditing, task?.id]);

	const currentTask = localTask ?? task;
	const isAuthor = currentTask?.author?.id === userId || currentTask?.authorId === userId;
	const isAssignee = currentTask?.assigneeId === userId || currentTask?.assignee?.id === userId;

	// Проверяем, является ли текущий пользователь руководителем (head role) для исполнителя
	const isHeadForAssignee = (() => {
		if (!currentTask?.assignee?.roles) return false;
		const assigneeRoles = (currentTask.assignee.roles as any[]).map((r: any) => r.alias || r);
		for (const role of currentRoles) {
			const childRole = ROLE_HIERARCHY[role];
			if (childRole && assigneeRoles.includes(childRole)) return true;
		}
		return false;
	})();

	// Задача, созданная главной ролью для дочерней — дочерняя не может редактировать/удалять
	const isCreatedByHead = (() => {
		if (!currentTask?.author?.roles) return false;
		const authorRoles = (currentTask.author.roles as any[]).map((r: any) => r.alias || r);
		return authorRoles.some((r: string) => Object.keys(ROLE_HIERARCHY).includes(r));
	})();

	// Создал для себя — только автор может редактировать
	const isSelfAssigned = currentTask?.authorId === currentTask?.assigneeId;

	const canModify = isAuthor || isBoss || isHeadForAssignee;
	// Дочерняя роль НЕ может редактировать/удалять задачу от руководителя
	// Самоназначенная задача — только автор
	// Если задача отменена или выполнена — редактирование закрыто для всех
	const isClosedStatus = currentTask?.status === 'cancelled' || currentTask?.status === 'completed';
	const canEditAndDelete = isClosedStatus
		? false
		: isSelfAssigned
			? isAuthor
			: canModify && !(isAssignee && !isAuthor && isCreatedByHead && !isBoss && !isHeadForAssignee);

	// Подчинённый (исполнитель, но не автор, не boss/admin и не руководитель) видит только "В работе" и "Выполнена"
	// Но текущий статус задачи всегда отображается (даже если это "ожидает" или "отменена")
	const isSuperAdmin = currentRoles.some((role: string) => ['boss', 'admin', 'developer'].includes(role));
	const taskStatusOptions = useMemo(() => {
		if (isAuthor || isSuperAdmin || isHeadForAssignee) return allTaskStatusOptions;
		return getAssigneeTaskStatusOptions(currentTask?.status || '');
	}, [isAuthor, isSuperAdmin, isHeadForAssignee, currentTask?.status]);

	// Если задача отменена или выполнена — менять статус может только руководитель
	const canChangeStatus = useMemo(() => {
		if (isClosedStatus) {
			return isAuthor || isSuperAdmin || isHeadForAssignee;
		}
		return isAuthor || isAssignee || isBoss;
	}, [isClosedStatus, isAuthor, isAssignee, isBoss, isSuperAdmin, isHeadForAssignee]);

	const handleStatusChange = useCallback(async (status: string) => {
		if (!currentTask) return;
		try {
			await updateTaskStatus({ id: currentTask.id, status }).unwrap();
			showNotification({ color: 'green', message: 'Статус задачи обновлён' });
			setLocalTask({ ...currentTask, status });
			onUpdated?.();
		} catch (e: any) {
			const message = e?.data?.message || 'Ошибка при смене статуса';
			showNotification({ color: 'red', message });
		}
	}, [currentTask, updateTaskStatus, onUpdated]);

	const handleDelete = useCallback(async () => {
		if (!currentTask) return;
		try {
			await deleteTask(currentTask.id).unwrap();
			showNotification({ color: 'green', message: 'Задача удалена' });
			setConfirmDelete(false);
			onClose();
			onDeleted?.();
		} catch (e: any) {
			const message = e?.data?.message || 'Ошибка при удалении задачи';
			showNotification({ color: 'red', message });
		}
	}, [currentTask, deleteTask, onClose, onDeleted]);

	const handleGoToOrganization = useCallback(() => {
		if (!currentTask?.organizationId) return;
		handleClose();
		router.push(`/crm/organization/${currentTask.organizationId}`);
	}, [currentTask, router]);

	const handleClose = useCallback(() => {
		setConfirmDelete(false);
		setEditing(false);
		setLocalTask(null);
		onClose();
	}, [onClose]);

	const handleStartEdit = useCallback(() => {
		if (!currentTask) return;
		const deadline = currentTask.deadline ? new Date(currentTask.deadline) : null;
		setEditForm({
			title: currentTask.title,
			description: currentTask.description || '',
			priority: currentTask.priority,
			status: currentTask.status,
			deadlineDate: deadline,
			deadlineTime: deadline ? format(deadline, 'HH:mm') : '18:00',
		});
		setEditing(true);
	}, [currentTask]);

	const handleEditSave = useCallback(async () => {
		if (!currentTask) return;
		if (editForm.title.trim().length < 3) {
			showNotification({ color: 'red', message: 'Заголовок: минимум 3 символа' });
			return;
		}

		let deadline: Date | undefined = undefined;
		if (editForm.deadlineDate) {
			deadline = new Date(editForm.deadlineDate);
			if (editForm.deadlineTime) {
				const [hours, minutes] = editForm.deadlineTime.split(':').map(Number);
				deadline.setHours(hours, minutes, 0, 0);
			}
		}

		try {
			await updateTask({
				id: currentTask.id,
				data: {
					title: editForm.title,
					description: editForm.description || undefined,
					priority: editForm.priority,
					status: editForm.status,
					deadline,
				},
			}).unwrap();
			showNotification({ color: 'green', message: 'Задача обновлена' });
			setEditing(false);
			onClose();
			onUpdated?.();
		} catch (e: any) {
			const message = e?.data?.message || 'Ошибка сохранения задачи';
			showNotification({ color: 'red', message });
		}
	}, [currentTask, editForm, updateTask, onClose, onUpdated]);

	if (!currentTask) return null;

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title={editing ? 'Редактирование задачи' : 'Задача'}
			size="md"
		>
			{editing ? (
				<Stack spacing="md">
					<TextInput
						label="Заголовок"
						placeholder="Введите заголовок"
						value={editForm.title}
						onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
						error={editForm.title.trim().length > 0 && editForm.title.trim().length < 3 ? 'Минимум 3 символа' : undefined}
					/>
					<Textarea
						label="Описание"
						placeholder="Описание задачи"
						value={editForm.description}
						onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
						minRows={3}
					/>
					<Group grow>
						<Select
							label="Статус"
							data={taskStatusOptions}
							value={editForm.status}
							onChange={(value) => value && setEditForm((f) => ({ ...f, status: value }))}
						/>
						<Select
							label="Приоритет"
							data={taskPriorityOptions}
							value={editForm.priority}
							onChange={(value) => value && setEditForm((f) => ({ ...f, priority: value }))}
						/>
					</Group>
					<Group grow>
						<DatePicker
							label="Дедлайн"
							placeholder="Выберите дату"
							value={editForm.deadlineDate}
							onChange={(value) => setEditForm((f) => ({ ...f, deadlineDate: value }))}
							locale="ru"
						/>
						<TextInput
							label="Время"
							type="time"
							value={editForm.deadlineTime}
							onChange={(e) => setEditForm((f) => ({ ...f, deadlineTime: e.target.value }))}
						/>
					</Group>
					<Group position="right">
						<Button variant="outline" onClick={() => setEditing(false)}>
							Отмена
						</Button>
						<Button
							onClick={handleEditSave}
							style={btnPrimary}
							onMouseEnter={handleBtnEnter}
							onMouseLeave={handleBtnLeave}
						>
							Сохранить
						</Button>
					</Group>
				</Stack>
			) : (
				<Stack spacing="md">
					<Group spacing="xs">
						<Badge color="violet">Задача CRM</Badge>
						<Badge color={CrmTaskConst.Priority[currentTask.priority as EnCrmTaskPriority]?.color || 'gray'}>
							{CrmTaskConst.Priority[currentTask.priority as EnCrmTaskPriority]?.label || currentTask.priority}
						</Badge>
					</Group>

					<Text size="xl" weight={600}>{currentTask.title}</Text>

					{currentTask.description && (
						<Text color="dimmed">{currentTask.description}</Text>
					)}

					<Paper p="sm" withBorder>
						<Stack spacing="xs">
							{currentTask.deadline && (
								<Group spacing="xs">
									<Text size="sm" color="dimmed">Дедлайн:</Text>
									<Text size="sm">
										{format(new Date(currentTask.deadline), 'd MMMM yyyy, HH:mm', { locale: ru })}
									</Text>
								</Group>
							)}
							<Group spacing="xs">
								<Text size="sm" color="dimmed">Статус:</Text>
								{canChangeStatus ? (
									<Select
										size="xs"
										data={taskStatusOptions}
										value={currentTask.status}
										onChange={(value) => value && handleStatusChange(value)}
										style={{ width: 160 }}
									/>
								) : (
									<Badge color={CrmTaskConst.Status[currentTask.status as keyof typeof CrmTaskConst.Status]?.color || 'gray'}>
										{CrmTaskConst.Status[currentTask.status as keyof typeof CrmTaskConst.Status]?.label || currentTask.status}
									</Badge>
								)}
							</Group>
							{currentTask.author && (
								<Group spacing="xs">
									<Text size="sm" color="dimmed">Автор:</Text>
									<Text size="sm">
										{currentTask.author.lastName} {currentTask.author.firstName}
									</Text>
								</Group>
							)}
							{currentTask.assignee && (
								<Group spacing="xs">
									<Text size="sm" color="dimmed">Исполнитель:</Text>
									<Text size="sm">
										{currentTask.assignee.lastName} {currentTask.assignee.firstName}
									</Text>
								</Group>
							)}
							{currentTask.organization && (
								<Group spacing="xs">
									<Text size="sm" color="dimmed">Организация:</Text>
									<Text size="sm">
										{(currentTask.organization as any).nameRu || (currentTask.organization as any).nameEn || (currentTask.organization as any).name}
									</Text>
								</Group>
							)}
						</Stack>
					</Paper>

					{confirmDelete ? (
						<Paper p="sm" withBorder style={{ backgroundColor: '#fff5f5' }}>
							<Stack spacing="xs">
								<Text size="sm" weight={500}>Вы уверены, что хотите удалить эту задачу?</Text>
								<Group position="right">
									<Button variant="outline" size="xs" onClick={() => setConfirmDelete(false)}>
										Отмена
									</Button>
									<Button
									size="xs"
									onClick={handleDelete}
									style={{ backgroundColor: '#e03131', color: '#fff', border: 'none' }}
									onMouseEnter={(e: any) => { e.currentTarget.style.backgroundColor = '#c92a2a'; }}
									onMouseLeave={(e: any) => { e.currentTarget.style.backgroundColor = '#e03131'; }}
								>
									Удалить
								</Button>
								</Group>
							</Stack>
						</Paper>
					) : (
						<Group position="right">
							{canEditAndDelete && (
								<Button color="red" variant="subtle" onClick={() => setConfirmDelete(true)}>
									Удалить
								</Button>
							)}
							{currentTask.organizationId && (
								<Button variant="light" onClick={handleGoToOrganization}>
									Перейти к организации
								</Button>
							)}
							<Button variant="outline" onClick={handleClose}>
								Закрыть
							</Button>
							{canEditAndDelete && (
								<Button
									onClick={handleStartEdit}
									style={btnPrimary}
									onMouseEnter={handleBtnEnter}
									onMouseLeave={handleBtnLeave}
								>
									Редактировать
								</Button>
							)}
						</Group>
					)}
				</Stack>
			)}
		</Modal>
	);
};
