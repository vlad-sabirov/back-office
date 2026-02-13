import { FC, useEffect, useMemo, useState } from 'react';
import { useForm } from '@mantine/form';
import { Button, Group, Select, TextInput, Textarea, Switch, Stack, MultiSelect } from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { setHours, setMinutes, subHours, subDays } from 'date-fns';
import {
	CalendarEventService,
	CalendarParticipantService,
	CalendarReminderService,
	ICalendarEventEntity,
	ICalendarEventFormEntity,
	EnCalendarEventType,
	CalendarEventConst,
} from '@fsd/entities/calendar-event';
import { StaffSelect } from '@fsd/entities/staff';
import { DatePicker } from '@fsd/shared/ui-kit';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { useUserDeprecated } from '@hooks';
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
}

const reminderOptions = [
	{ value: '15m', label: 'За 15 минут' },
	{ value: '30m', label: 'За 30 минут' },
	{ value: '1h', label: 'За 1 час' },
	{ value: '2h', label: 'За 2 часа' },
	{ value: '1d', label: 'За 1 день' },
];

const typeOptions = Object.entries(CalendarEventConst.Type).map(([value, config]) => ({
	value,
	label: config.label,
}));

const getTimeFromDate = (date: Date | string | null, defaultHour = 9): Date => {
	if (!date) {
		const d = new Date();
		d.setHours(defaultHour, 0, 0, 0);
		return d;
	}
	const d = typeof date === 'string' ? new Date(date) : new Date(date);
	return d;
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
	const staffAll = useStateSelector((state) => state.staff.data.all);
	const [createEvent, { isLoading: isCreating }] = CalendarEventService.create();
	const [updateEvent, { isLoading: isUpdating }] = CalendarEventService.update();
	const [addParticipants] = CalendarParticipantService.addParticipants();
	const [createReminder] = CalendarReminderService.create();

	const isLoading = isCreating || isUpdating;

	// Состояние для отслеживания текущего assigneeId (для фильтрации участников)
	const [currentAssigneeId, setCurrentAssigneeId] = useState<number>(
		event?.assigneeId || assigneeId || user?.id || 0
	);

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

	const form = useForm<FormValues>({
		initialValues: {
			type: event?.type || EnCalendarEventType.Meeting,
			title: event?.title || '',
			description: event?.description || '',
			dateStart: event?.dateStart ? new Date(event.dateStart) : defaultDate || new Date(),
			timeStart: getTimeFromDate(event?.dateStart || null, 9),
			dateEnd: event?.dateEnd ? new Date(event.dateEnd) : defaultDate || new Date(),
			timeEnd: getTimeFromDate(event?.dateEnd || null, 10),
			isAllDay: event?.isAllDay ?? false,
			location: event?.location || '',
			authorId: event?.authorId || user?.id || 0,
			assigneeId: event?.assigneeId || assigneeId || user?.id || 0,
			organizationId: event?.organizationId || organizationId || null,
			contactId: event?.contactId || contactId || null,
			taskId: event?.taskId || taskId || null,
			participantIds: eventParticipantIds,
			reminderTime: null,
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
				timeStart: getTimeFromDate(event.dateStart, 9),
				dateEnd: new Date(event.dateEnd),
				timeEnd: getTimeFromDate(event.dateEnd, 10),
				isAllDay: event.isAllDay,
				location: event.location || '',
				authorId: event.authorId,
				assigneeId: event.assigneeId,
				organizationId: event.organizationId || null,
				contactId: event.contactId || null,
				taskId: event.taskId || null,
				participantIds,
				reminderTime: null,
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

	const calculateReminderTime = (eventStart: Date, reminderOption: string | null): Date | null => {
		if (!reminderOption) return null;
		switch (reminderOption) {
			case '15m': return subHours(eventStart, 0.25);
			case '30m': return subHours(eventStart, 0.5);
			case '1h': return subHours(eventStart, 1);
			case '2h': return subHours(eventStart, 2);
			case '1d': return subDays(eventStart, 1);
			default: return null;
		}
	};

	const handleSubmit = async (values: FormValues) => {
		// Проверка что authorId и assigneeId валидны
		if (!values.authorId || values.authorId === 0) {
			console.error('authorId не установлен');
			return;
		}
		if (!values.assigneeId || values.assigneeId === 0) {
			console.error('assigneeId не установлен');
			return;
		}

		try {
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
				await updateEvent({ id: event.id, data });
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
				const remindAt = calculateReminderTime(dateStart, values.reminderTime);
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

			onSuccess?.();
		} catch (error) {
			console.error('Ошибка сохранения события:', error);
		}
	};

	return (
		<form onSubmit={form.onSubmit(handleSubmit)} className={css.form}>
			<Stack spacing="md">
				<Select
					label="Тип события"
					placeholder="Выберите тип"
					data={typeOptions}
					required
					{...form.getInputProps('type')}
				/>

				<TextInput
					label="Название"
					placeholder="Введите название события"
					required
					{...form.getInputProps('title')}
				/>

				<Textarea
					label="Описание"
					placeholder="Введите описание"
					minRows={3}
					{...form.getInputProps('description')}
				/>

				<Switch
					label="Весь день"
					{...form.getInputProps('isAllDay', { type: 'checkbox' })}
				/>

				<Group grow>
					<DatePicker
						label="Дата начала"
						placeholder="Выберите дату"
						value={form.values.dateStart}
						onChange={(value) => form.setFieldValue('dateStart', value)}
						error={form.errors.dateStart}
					/>
					{!form.values.isAllDay && (
						<TimeInput
							label="Время начала"
							{...form.getInputProps('timeStart')}
						/>
					)}
				</Group>

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

				<TextInput
					label="Место"
					placeholder="Укажите место проведения"
					{...form.getInputProps('location')}
				/>

				<StaffSelect
					label="Исполнитель"
					placeholder="Выберите сотрудника"
					users={staffAll}
					value={form.values.assigneeId ? [String(form.values.assigneeId)] : []}
					onChange={(value) => {
						const newAssigneeId = value && value.length > 0 ? Number(value[0]) : user?.id || 0;
						form.setFieldValue('assigneeId', newAssigneeId);
						setCurrentAssigneeId(newAssigneeId);
					}}
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

				<Select
					label="Напоминание"
					placeholder="Выберите время напоминания"
					data={reminderOptions}
					value={form.values.reminderTime}
					onChange={(value) => form.setFieldValue('reminderTime', value)}
					clearable
				/>

				<Group position="right" mt="md">
					<Button variant="outline" onClick={onCancel} disabled={isLoading}>
						Отмена
					</Button>
					<Button
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
