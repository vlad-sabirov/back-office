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
	const { userId } = useUserDeprecated();
	const historyActions = useCrmHistoryActions();

	// ID организации
	const organizationId = useMemo(() => {
		return currentOrganization?.id || null;
	}, [currentOrganization]);

	// Менеджер организации (кому назначается задача)
	const assigneeId = useMemo(() => {
		return currentOrganization?.userId || null;
	}, [currentOrganization]);

	const form = useForm({
		initialValues: {
			title: '',
			description: '',
			priority: EnCrmTaskPriority.Normal,
			deadline: null as Date | null,
		},
		validate: {
			title: (value) => (value.trim().length < 3 ? 'Минимум 3 символа' : null),
		},
	});

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
			deadline: form.values.deadline || undefined,
			authorId: userId || 0,
			assigneeId: assigneeId, // Менеджер организации
			organizationId: organizationId || undefined,
		});
		historyActions.reloadTimestamp();
	}, [create, form, userId, assigneeId, organizationId, historyActions]);

	useEffect(() => {
		if (createProps.status === 'uninitialized') return;
		const status = FetchStatusConvert(createProps);
		setIsLoading(FetchStatusIsLoading(status));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [createProps.status]);

	useEffect(() => {
		if (createProps.error) {
			showNotification({ color: 'red', message: 'Ошибка создания задачи' });
		}
	}, [createProps.error, createProps.startedTimeStamp]);

	useEffect(() => {
		if (createProps.isSuccess) {
			showNotification({ color: 'green', message: 'Задача создана' });
			form.reset();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [createProps.fulfilledTimeStamp, createProps.isSuccess]);

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
						{...form.getInputProps('deadline')}
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
