import { FC, useEffect, useMemo, useState } from 'react';
import { useForm } from '@mantine/form';
import { Button, Group, Select, TextInput, Textarea, Switch, Stack, MultiSelect } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { TimeInput } from '@mantine/dates';
import { setHours, setMinutes, addMinutes, subHours, subDays } from 'date-fns';
import {
	CalendarEventService,
	CalendarParticipantService,
	CalendarReminderService,
	ICalendarEventEntity,
	ICalendarEventFormEntity,
	EnCalendarEventType,
	CalendarEventConst,
} from '@fsd/entities/calendar-event';
import { CrmTaskService, ICrmTaskFormEntity, EnCrmTaskPriority } from '@fsd/entities/crm-task';
import { CrmOrganizationService } from '@fsd/entities/crm-organization';
import { CrmHistoryService } from '@fsd/entities/crm-history';
import { StaffSelect } from '@fsd/entities/staff';
import { DatePicker } from '@fsd/shared/ui-kit';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { useAccess, useUserDeprecated } from '@hooks';
import css from './CalendarEventForm.module.scss';

interface CalendarEventFormProps {
	event?: ICalendarEventEntity | null;
	defaultDate?: Date | null;
	assigneeId?: number;
	organizationId?: number | null;
	contactId?: number | null;
	taskId?: number | null;
	onSuccess?: () => void;
	onCancel?: () => void;
}

interface FormValues {
	type: string;
	title: string;
	description: string;
	priority: string;
	dateStart: Date | null;
	timeStart: Date | null;
	dateEnd: Date | null;
	timeEnd: Date | null;
	isAllDay: boolean;
	location: string;
	authorId: number;
	assigneeId: number;
	organizationId: number | null;
	contactId: number | null;
	taskId: number | null;
	participantIds: string[];
	reminderTime: string | null;
	customReminderDate: Date | null;
}

const reminderOptions = [
	{ value: '1h', label: 'За 1 час' },
	{ value: '3h', label: 'За 3 часа' },
	{ value: '1d', label: 'За 1 день' },
	{ value: '3d', label: 'За 3 дня' },
	{ value: 'custom', label: 'Своё время' },
];

const eventTypeOptions = Object.entries(CalendarEventConst.Type).map(([value, config]) => ({
	value,
	label: config.label,
}));

const typeOptionsWithTask = [
	{ value: 'task', label: 'Задача' },
	...eventTypeOptions,
];

const priorityOptions = Object.entries(EnCrmTaskPriority).map(([, value]) => ({
	value,
	label: value === 'low' ? 'Низкий' : value === 'normal' ? 'Обычный' : value === 'high' ? 'Высокий' : 'Срочный',
}));

const getTimeFromDate = (date: Date | string | null, fallback?: Date): Date => {
	if (!date) {
		return fallback || new Date();
	}
	return typeof date === 'string' ? new Date(date) : new Date(date);
};

/** Время начала по умолчанию: сейчас + 30 минут (округлено до 5 мин) */
const getDefaultStartTime = (): Date => {
	const d = addMinutes(new Date(), 30);
	// Округляем минуты вверх до ближайших 5
	const m = Math.ceil(d.getMinutes() / 5) * 5;
	d.setMinutes(m, 0, 0);
	return d;
};

/** Время окончания по умолчанию: startTime + 15 минут */
const getDefaultEndTime = (startTime: Date): Date => {
	return addMinutes(startTime, 15);
};

const combineDateAndTime = (date: Date | null, time: string | Date | null): Date => {
	if (!date) return new Date();

	let hours = 9;
	let minutes = 0;

	if (time instanceof Date) {
		hours = time.getHours();
		minutes = time.getMinutes();
	} else if (typeof time === 'string' && time.includes(':')) {
		const parts = time.split(':').map(Number);
		hours = parts[0] || 0;
		minutes = parts[1] || 0;
	}

	return setMinutes(setHours(date, hours), minutes);
};

export const CalendarEventForm: FC<CalendarEventFormProps> = ({
	event,
	defaultDate,
	assigneeId,
	organizationId,
	contactId,
	taskId,
	onSuccess,
	onCancel,
}) => {
	const { user } = useUserDeprecated();
	const CheckAccess = useAccess();
	const isBoss = CheckAccess(['boss', 'crmAdmin']);
	const authRoles = useStateSelector((state) => state.app.auth.roles);
	const staffAll = useStateSelector((state) => state.staff.data.all);
	const [createEvent, { isLoading: isCreating }] = CalendarEventService.create();
	const [updateEvent, { isLoading: isUpdating }] = CalendarEventService.update();
	const [addParticipants] = CalendarParticipantService.addParticipants();
	const [createReminder] = CalendarReminderService.create();
	const [createTask, { isLoading: isCreatingTask }] = CrmTaskService.create();
	const [createHistory] = CrmHistoryService.create();
	const [fetchOrganizations, { data: orgData }] = CrmOrganizationService.findMany();

	const isLoading = isCreating || isUpdating || isCreatingTask;

	// Состояние для отслеживания текущего assigneeId (для фильтрации участников)
	const [currentAssigneeId, setCurrentAssigneeId] = useState<number>(
		event?.assigneeId || assigneeId || user?.id || 0
	);
	const [customReminderTime, setCustomReminderTime] = useState<string>('');

	// Список сотрудников для выбора исполнителя
	// boss: все кроме других boss (себя видит)
	// crmAdmin: все кроме boss и других crmAdmin (себя видит)
	const assigneeStaffList = useMemo(() => {
		if (!isBoss) return staffAll;

		const currentUserId = user?.id;
		const hasBossRole = authRoles?.includes('boss');
		const hasCrmAdminRole = authRoles?.includes('crmAdmin');

		return staffAll.filter((s) => {
			// Себя всегда показываем
			if (s.id === currentUserId) return true;

			if (hasBossRole) {
				// Boss: скрываем других boss
				return !s.roles?.some((r) => r.alias === 'boss');
			}

			if (hasCrmAdminRole) {
				// crmAdmin: скрываем boss и других crmAdmin
				return !s.roles?.some((r) => ['boss', 'crmAdmin'].includes(r.alias));
			}

			// admin/developer без boss/crmAdmin — показываем всех
			return true;
		});
	}, [staffAll, isBoss, authRoles, user?.id]);

	// Опции организаций для селекта
	const orgOptions = useMemo(() => {
		if (!orgData?.data) return [];
		return orgData.data.map((org) => ({
			value: String(org.id),
			label: org.nameRu || org.nameEn || `#${org.id}`,
		}));
	}, [orgData]);

	// Тип-опции: при редактировании — без "Задача", при создании — с "Задача"
	const typeOptions = useMemo(() => {
		return event ? eventTypeOptions : typeOptionsWithTask;
	}, [event]);

	// Получить участников события (для редактирования)
	const eventParticipantIds = useMemo(() => {
		if (event?.participants && Array.isArray(event.participants)) {
			return event.participants.map((p: any) => String(p.userId));
		}
		return [];
	}, [event]);

	// Опции для выбора участников (исключаем исполнителя)
	const participantOptions = useMemo(() => {
		return staffAll
			.filter((s) => s.id !== currentAssigneeId)
			.map((s) => ({
				value: String(s.id),
				label: `${s.lastName || ''} ${s.firstName || ''}`.trim(),
			}));
	}, [staffAll, currentAssigneeId]);

	const defaultStart = useMemo(() => getDefaultStartTime(), []);
	const defaultEnd = useMemo(() => getDefaultEndTime(defaultStart), [defaultStart]);

	const form = useForm<FormValues>({
		initialValues: {
			type: event?.type || EnCalendarEventType.Meeting,
			title: event?.title || '',
			description: event?.description || '',
			priority: EnCrmTaskPriority.Normal,
			dateStart: event?.dateStart ? new Date(event.dateStart) : defaultDate || new Date(),
			timeStart: getTimeFromDate(event?.dateStart || null, defaultStart),
			dateEnd: event?.dateEnd ? new Date(event.dateEnd) : defaultDate || new Date(),
			timeEnd: getTimeFromDate(event?.dateEnd || null, defaultEnd),
			isAllDay: event?.isAllDay ?? false,
			location: event?.location || '',
			authorId: event?.authorId || user?.id || 0,
			assigneeId: event?.assigneeId || assigneeId || user?.id || 0,
			organizationId: event?.organizationId || organizationId || null,
			contactId: event?.contactId || contactId || null,
			taskId: event?.taskId || taskId || null,
			participantIds: eventParticipantIds,
			reminderTime: null,
			customReminderDate: null,
		},
		validate: {
			title: (value) => {
				if (!value || value.trim().length === 0) {
					return CalendarEventConst.Form.Title.IsRequired;
				}
				if (value.length < CalendarEventConst.Form.Title.MinLength.Count) {
					return CalendarEventConst.Form.Title.MinLength.Message;
				}
				if (value.length > CalendarEventConst.Form.Title.MaxLength.Count) {
					return CalendarEventConst.Form.Title.MaxLength.Message;
				}
				return null;
			},
			description: (value) => {
				if (value && value.length > CalendarEventConst.Form.Description.MaxLength.Count) {
					return CalendarEventConst.Form.Description.MaxLength.Message;
				}
				return null;
			},
			dateStart: (value) => {
				if (!value) return CalendarEventConst.Form.DateStart.IsRequired;
				return null;
			},
			dateEnd: (value, values) => {
				if (values.type === 'task') return null;
				if (!value) return CalendarEventConst.Form.DateEnd.IsRequired;
				const startDateTime = combineDateAndTime(values.dateStart, values.timeStart);
				const endDateTime = combineDateAndTime(value, values.timeEnd);
				if (endDateTime <= startDateTime) {
					return CalendarEventConst.Form.DateEnd.MustBeAfterStart;
				}
				return null;
			},
			type: (value) => {
				if (!value) return CalendarEventConst.Form.Type.IsRequired;
				return null;
			},
		},
	});

	// Загрузка организаций (для задач/звонков — по исполнителю, для остальных — по роли)
	const isAssigneeFilteredType = form.values.type === 'task' || form.values.type === EnCalendarEventType.Call;

	useEffect(() => {
		const isPrivileged = authRoles?.some((r) => ['boss', 'crmAdmin', 'admin', 'developer'].includes(r));

		const effectiveUserId = isAssigneeFilteredType
			? currentAssigneeId
			: (isPrivileged ? null : user?.id);

		fetchOrganizations({
			where: {
				isArchive: false,
				...(effectiveUserId ? { userId: { in: [effectiveUserId] } } : {}),
			},
			filter: { orderBy: { nameEn: 'asc' }, take: 1000 },
		});
	}, [user?.id, authRoles, currentAssigneeId, isAssigneeFilteredType]);

	// Сбрасываем организацию при переключении типа на задачу/звонок
	useEffect(() => {
		if (isAssigneeFilteredType) {
			form.setFieldValue('organizationId', null);
		}
	}, [isAssigneeFilteredType]);

	// Обновляем форму при изменении event
	useEffect(() => {
		if (event) {
			const participantIds = event.participants && Array.isArray(event.participants)
				? event.participants.map((p: any) => String(p.userId))
				: [];
			form.setValues({
				type: event.type,
				title: event.title,
				description: event.description || '',
				dateStart: new Date(event.dateStart),
				timeStart: getTimeFromDate(event.dateStart),
				dateEnd: new Date(event.dateEnd),
				timeEnd: getTimeFromDate(event.dateEnd),
				isAllDay: event.isAllDay,
				location: event.location || '',
				authorId: event.authorId,
				assigneeId: event.assigneeId,
				organizationId: event.organizationId || null,
				contactId: event.contactId || null,
				taskId: event.taskId || null,
				participantIds,
				reminderTime: null,
				customReminderDate: null,
			});
			setCurrentAssigneeId(event.assigneeId);
		}
	}, [event]);

	// Обновляем authorId и assigneeId когда user загрузится (для нового события)
	useEffect(() => {
		if (user?.id && !event) {
			if (form.values.authorId === 0) {
				form.setFieldValue('authorId', user.id);
			}
			if (form.values.assigneeId === 0) {
				form.setFieldValue('assigneeId', user.id);
				setCurrentAssigneeId(user.id);
			}
		}
	}, [user?.id, event]);

	// Обновляем assigneeId когда пропс меняется (выбор другого подчинённого)
	useEffect(() => {
		if (!event && assigneeId && assigneeId !== form.values.assigneeId) {
			form.setFieldValue('assigneeId', assigneeId);
			setCurrentAssigneeId(assigneeId);
			form.setFieldValue('organizationId', null);
		}
	}, [assigneeId, event]);

	const calculateReminderTime = (eventStart: Date, reminderOption: string | null): Date | null => {
		if (!reminderOption || reminderOption === 'custom') return null;
		switch (reminderOption) {
			case '1h': return subHours(eventStart, 1);
			case '3h': return subHours(eventStart, 3);
			case '1d': return subDays(eventStart, 1);
			case '3d': return subDays(eventStart, 3);
			default: return null;
		}
	};

	const handleSubmit = async (values: FormValues) => {
		// Проверка что authorId и assigneeId валидны
		if (!values.authorId || values.authorId === 0) {
			showNotification({ color: 'red', message: 'Ошибка: автор не определён. Попробуйте перезагрузить страницу.' });
			return;
		}
		if (!values.assigneeId || values.assigneeId === 0) {
			showNotification({ color: 'red', message: 'Ошибка: исполнитель не выбран' });
			return;
		}

		try {
			if (values.type === 'task') {
				// Создание CrmTask
				const taskData: ICrmTaskFormEntity = {
					title: values.title,
					description: values.description || undefined,
					priority: values.priority,
					deadline: combineDateAndTime(values.dateStart, values.timeStart).toISOString(),
					authorId: values.authorId,
					assigneeId: values.assigneeId,
					organizationId: values.organizationId || undefined,
				};
				const result = await createTask(taskData).unwrap();

				// Создание записи истории если выбрана организация
				if (values.organizationId && result?.id) {
					try {
						await createHistory({
							type: 'log',
							payload: JSON.stringify({
								action: 'task_created',
								taskId: result.id,
								title: values.title,
							}),
							isSystem: true,
							userId: values.authorId,
							organizationId: values.organizationId,
						});
					} catch (e) {
						console.error('Ошибка создания записи истории:', e);
					}
				}

				showNotification({ color: 'green', message: 'Задача создана' });
				onSuccess?.();
			} else {
				// Существующая логика создания/редактирования события
				const dateStart = combineDateAndTime(values.dateStart, values.timeStart);
				const dateEnd = combineDateAndTime(values.dateEnd, values.timeEnd);

				const data: ICalendarEventFormEntity = {
					type: values.type,
					title: values.title,
					description: values.description || undefined,
					dateStart: dateStart.toISOString(),
					dateEnd: dateEnd.toISOString(),
					isAllDay: values.isAllDay,
					location: values.location || undefined,
					authorId: values.authorId,
					assigneeId: values.assigneeId,
					organizationId: values.organizationId,
					contactId: values.contactId,
					taskId: values.taskId,
				};

				let eventId: number | undefined;

				if (event?.id) {
					await updateEvent({ id: event.id, data }).unwrap();
					eventId = event.id;
				} else {
					const result = await createEvent(data).unwrap();
					eventId = result?.id;
				}

				// Добавить участников (для встреч)
				if (eventId && values.type === EnCalendarEventType.Meeting && values.participantIds.length > 0) {
					try {
						await addParticipants({
							eventId,
							userIds: values.participantIds.map(Number),
						}).unwrap();
					} catch (e) {
						console.error('Ошибка добавления участников:', e);
					}
				}

				// Добавить напоминание
				if (eventId && values.reminderTime) {
					let remindAt: Date | null = null;
					if (values.reminderTime === 'custom' && values.customReminderDate) {
						remindAt = new Date(values.customReminderDate);
						if (customReminderTime) {
							const [h, m] = customReminderTime.split(':').map(Number);
							remindAt.setHours(h, m, 0, 0);
						}
					} else {
						remindAt = calculateReminderTime(dateStart, values.reminderTime);
					}
					if (remindAt && remindAt > new Date()) {
						try {
							await createReminder({
								eventId,
								remindAt: remindAt.toISOString(),
							}).unwrap();
						} catch (e) {
							console.error('Ошибка создания напоминания:', e);
						}
					}
				}

				// Создание записи истории если выбрана организация
				if (values.organizationId && eventId && !event?.id) {
					try {
						await createHistory({
							type: 'log',
							payload: JSON.stringify({
								action: 'event_created',
								eventId,
								title: values.title,
								type: values.type,
							}),
							isSystem: true,
							userId: values.authorId,
							organizationId: values.organizationId,
						});
					} catch (e) {
						console.error('Ошибка создания записи истории:', e);
					}
				}

				showNotification({ color: 'green', message: event?.id ? 'Событие обновлено' : 'Событие создано' });
				onSuccess?.();
			}
		} catch (error: any) {
			const message = error?.data?.message || error?.message || 'Ошибка сохранения';
			showNotification({ color: 'red', message });
			console.error('Ошибка сохранения:', error);
		}
	};

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className={css.form}>
			<Stack spacing="md">
				<Select
					label="Тип"
					placeholder="Выберите тип"
					data={typeOptions}
					required
					{...form.getInputProps('type')}
				/>

				<TextInput
					label="Название"
					placeholder="Введите название"
					required
					{...form.getInputProps('title')}
				/>

				<Textarea
					label="Описание"
					placeholder="Введите описание"
					minRows={3}
					{...form.getInputProps('description')}
				/>

				{form.values.type === 'task' && (
					<Select
						label="Приоритет"
						placeholder="Выберите приоритет"
						data={priorityOptions}
						{...form.getInputProps('priority')}
					/>
				)}

				{form.values.type !== 'task' && (
					<Switch
						label="Весь день"
						{...form.getInputProps('isAllDay', { type: 'checkbox' })}
					/>
				)}

				<Group grow>
					<DatePicker
						label={form.values.type === 'task' ? 'Дедлайн' : 'Дата начала'}
						placeholder="Выберите дату"
						value={form.values.dateStart}
						onChange={(value) => form.setFieldValue('dateStart', value)}
						error={form.errors.dateStart}
					/>
					{(form.values.type === 'task' || !form.values.isAllDay) && (
						<TimeInput
							label={form.values.type === 'task' ? 'Время' : 'Время начала'}
							{...form.getInputProps('timeStart')}
						/>
					)}
				</Group>

				{form.values.type !== 'task' && (
					<Group grow>
						<DatePicker
							label="Дата окончания"
							placeholder="Выберите дату"
							value={form.values.dateEnd}
							onChange={(value) => form.setFieldValue('dateEnd', value)}
							error={form.errors.dateEnd}
						/>
						{!form.values.isAllDay && (
							<TimeInput
								label="Время окончания"
								{...form.getInputProps('timeEnd')}
							/>
						)}
					</Group>
				)}

				{form.values.type !== 'task' && (
					<TextInput
						label="Место"
						placeholder="Укажите место проведения"
						{...form.getInputProps('location')}
					/>
				)}

				{isBoss ? (
					<StaffSelect
						label="Исполнитель"
						placeholder="Выберите сотрудника"
						users={assigneeStaffList}
						value={form.values.assigneeId ? [String(form.values.assigneeId)] : []}
						onChange={(value) => {
							const newAssigneeId = value && value.length > 0 ? Number(value[0]) : 0;
							form.setFieldValue('assigneeId', newAssigneeId);
							setCurrentAssigneeId(newAssigneeId);
							form.setFieldValue('organizationId', null);
						}}
					/>
				) : (
					<TextInput
						label="Исполнитель"
						value={(() => {
							const s = staffAll.find((s) => s.id === form.values.assigneeId);
							if (s) return `${s.lastName} ${s.firstName}`;
							return user ? `${user.lastName} ${user.firstName}` : '';
						})()}
						readOnly
					/>
				)}

				<Select
					label="Организация"
					placeholder="Выберите организацию (необязательно)"
					data={orgOptions}
					value={form.values.organizationId ? String(form.values.organizationId) : null}
					onChange={(value) => form.setFieldValue('organizationId', value ? Number(value) : null)}
					searchable
					clearable
				/>

				{form.values.type === EnCalendarEventType.Meeting && (
					<MultiSelect
						label="Участники"
						placeholder="Выберите участников"
						data={participantOptions}
						value={form.values.participantIds}
						onChange={(value) => form.setFieldValue('participantIds', value)}
						searchable
						clearable
					/>
				)}

				{form.values.type !== 'task' && (
					<>
						<Select
							label="Напоминание"
							placeholder="Выберите время напоминания"
							data={reminderOptions}
							value={form.values.reminderTime}
							onChange={(value) => form.setFieldValue('reminderTime', value)}
							clearable
						/>
						{form.values.reminderTime === 'custom' && (
							<Group grow>
								<DatePicker
									label="Дата напоминания"
									placeholder="Выберите дату"
									value={form.values.customReminderDate}
									onChange={(value) => form.setFieldValue('customReminderDate', value)}
									minDate={new Date()}
								/>
								<TimeInput
									label="Время напоминания"
									value={customReminderTime}
									onChange={(e) => setCustomReminderTime(e.currentTarget.value)}
								/>
							</Group>
						)}
					</>
				)}

				<Group position="right" mt="md">
					<Button className={css.btnOutline} onClick={onCancel} disabled={isLoading}>
						Отмена
					</Button>
					<Button
						className={css.btnPrimary}
						type="submit"
						loading={isLoading}
						disabled={!form.values.authorId || form.values.authorId === 0}
					>
						{event?.id ? 'Сохранить' : 'Создать'}
					</Button>
				</Group>
			</Stack>
		</form>
	);
};
