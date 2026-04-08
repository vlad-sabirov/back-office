import { FC, useCallback, useState } from 'react';
import { Button, Select, TextInput, Textarea } from '@mantine/core';
import { DatePicker } from '@fsd/shared/ui-kit';
import { showNotification } from '@mantine/notifications';
import { Popover, Tooltip, HoverCard, Text } from '@mantine/core';
import { CallTo } from '@fsd/entities/voip/ui/call-to/CallTo';
import { CrmTaskService, EnCrmTaskPriority } from '@fsd/entities/crm-task';
import { CalendarEventService, EnCalendarEventType, CalendarEventConst } from '@fsd/entities/calendar-event';
import { CrmHistoryService } from '@fsd/entities/crm-history';
import { useUserDeprecated } from '@hooks';
import { ICrmOrganizationEntity } from '@fsd/entities/crm-organization';
import { parsePhoneNumber } from '@fsd/shared/lib/parsePhoneNumber';
import css from './quick-actions.module.scss';

interface QuickActionsProps {
	organization: ICrmOrganizationEntity;
}

const priorityOptions = [
	{ value: EnCrmTaskPriority.Low, label: 'Низкий' },
	{ value: EnCrmTaskPriority.Normal, label: 'Обычный' },
	{ value: EnCrmTaskPriority.High, label: 'Высокий' },
	{ value: EnCrmTaskPriority.Urgent, label: 'Срочный' },
];

const typeOptions = [
	{ value: 'task', label: 'Задача' },
	{ value: EnCalendarEventType.Meeting, label: 'Встреча' },
	{ value: EnCalendarEventType.Call, label: 'Звонок' },
	{ value: EnCalendarEventType.Reminder, label: 'Напоминание' },
	{ value: EnCalendarEventType.Note, label: 'Заметка' },
];

export const QuickActions: FC<QuickActionsProps> = ({ organization }) => {
	const { userId } = useUserDeprecated();

	// Ищем телефон: сначала у организации, потом у контактов
	const orgPhone = organization.phones?.[0]?.value;
	const contactWithPhone = organization.contacts?.find((c: any) => c.phones?.length > 0);
	const contactPhone = (contactWithPhone as any)?.phones?.[0]?.value;
	const firstPhone = orgPhone || contactPhone;
	const firstContactName = contactWithPhone?.name || organization.contacts?.[0]?.name;

	const lastNote = (organization as any).notes?.[0];

	return (
		<div className={css.root}>
			{lastNote && (
				<HoverCard withArrow position="left" width={250} shadow="md" openDelay={300}>
					<HoverCard.Target>
						<span className={css.noteIcon}>📌</span>
					</HoverCard.Target>
					<HoverCard.Dropdown>
						<Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{lastNote.text}</Text>
					</HoverCard.Dropdown>
				</HoverCard>
			)}
			<CallButton phone={firstPhone} contactName={firstContactName} orgName={organization.nameRu || organization.nameEn} />
			<QuickTaskButton organization={organization} userId={userId} />
			<QuickNoteButton organization={organization} userId={userId} />
		</div>
	);
};

// 📞 Кнопка звонка
const CallButton: FC<{ phone?: string; contactName?: string; orgName?: string }> = ({ phone, contactName, orgName }) => {
	if (!phone) {
		return (
			<Tooltip label="Нет телефона" withArrow position="top">
				<button className={`${css.btn} ${css.btn_disabled}`}>📞</button>
			</Tooltip>
		);
	}

	return (
		<CallTo callToPhone={phone} callToName={contactName || orgName || ''} offset={10}>
			<Tooltip label={`Позвонить ${parsePhoneNumber(phone).output}`} withArrow position="top">
				<button className={css.btn}>📞</button>
			</Tooltip>
		</CallTo>
	);
};

// ✅ Быстрая задача / событие
const QuickTaskButton: FC<{ organization: ICrmOrganizationEntity; userId: number | null }> = ({ organization, userId }) => {
	const [opened, setOpened] = useState(false);
	const [eventType, setEventType] = useState<string>('task');
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [priority, setPriority] = useState<string>(EnCrmTaskPriority.Normal);
	const [deadlineDate, setDeadlineDate] = useState<Date | null>(new Date());
	const [createTask, { isLoading: isCreatingTask }] = CrmTaskService.create();
	const [createEvent, { isLoading: isCreatingEvent }] = CalendarEventService.create();

	const isLoading = isCreatingTask || isCreatingEvent;
	const isTask = eventType === 'task';

	const handleSubmit = useCallback(async () => {
		if (!title.trim() || title.trim().length < 3) {
			showNotification({ color: 'red', message: 'Минимум 3 символа' });
			return;
		}
		const deadline = deadlineDate || new Date();
		deadline.setHours(18, 0, 0, 0);

		if (isTask) {
			await createTask({
				title: title.trim(),
				description: description.trim() || undefined,
				priority,
				deadline: deadline.toISOString(),
				authorId: userId || 0,
				assigneeId: organization.userId || userId || 0,
				organizationId: organization.id,
			});
			showNotification({ color: 'green', message: 'Задача создана' });
		} else {
			const dateEnd = new Date(deadline);
			dateEnd.setMinutes(dateEnd.getMinutes() + 30);
			await createEvent({
				type: eventType,
				title: title.trim(),
				description: description.trim() || undefined,
				dateStart: deadline.toISOString(),
				dateEnd: dateEnd.toISOString(),
				isAllDay: false,
				authorId: userId || 0,
				assigneeId: organization.userId || userId || 0,
				organizationId: organization.id,
			});
			showNotification({ color: 'green', message: 'Событие создано' });
		}

		setTitle('');
		setDescription('');
		setPriority(EnCrmTaskPriority.Normal);
		setEventType('task');
		setOpened(false);
	}, [title, description, priority, deadlineDate, eventType, isTask, createTask, createEvent, userId, organization]);

	return (
		<Popover opened={opened} onChange={setOpened} withArrow shadow="xl" radius="md" width={320} position="bottom-end">
			<Popover.Target>
				<Tooltip label="Быстрая задача" withArrow position="top">
					<button className={css.btn} onClick={() => setOpened(true)}>✅</button>
				</Tooltip>
			</Popover.Target>
			<Popover.Dropdown>
				<div className={css.taskPopup}>
					<Select
						label="Тип"
						data={typeOptions}
						value={eventType}
						onChange={(val) => setEventType(val || 'task')}
						size="xs"
					/>
					<TextInput
						label="Название"
						placeholder="Введите название"
						value={title}
						onChange={(e) => setTitle(e.currentTarget.value)}
						size="xs"
						autoFocus
						onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
					/>
					<Textarea
						label="Описание"
						placeholder="Описание (необязательно)"
						value={description}
						onChange={(e) => setDescription(e.currentTarget.value)}
						size="xs"
						minRows={2}
					/>
					<div className={css.taskRow}>
						{isTask && (
							<Select
								label="Приоритет"
								data={priorityOptions}
								value={priority}
								onChange={(val) => setPriority(val || EnCrmTaskPriority.Normal)}
								size="xs"
								style={{ flex: 1 }}
							/>
						)}
						<DatePicker
							label={isTask ? 'Дедлайн' : 'Дата'}
							value={deadlineDate}
							onChange={setDeadlineDate}
							minDate={new Date()}
							size="xs"
							style={{ flex: 1 }}
						/>
					</div>
					<Button size="xs" onClick={handleSubmit} loading={isLoading} fullWidth>
						Создать
					</Button>
				</div>
			</Popover.Dropdown>
		</Popover>
	);
};

// 💬 Быстрый комментарий
const QuickNoteButton: FC<{ organization: ICrmOrganizationEntity; userId: number | null }> = ({ organization, userId }) => {
	const [opened, setOpened] = useState(false);
	const [text, setText] = useState('');
	const [createHistory, { isLoading }] = CrmHistoryService.create();

	const handleSubmit = useCallback(async () => {
		if (!text.trim()) return;

		await createHistory({
			type: 'comment',
			payload: text.trim(),
			isSystem: false,
			userId: userId || 0,
			organizationId: organization.id,
		});

		showNotification({ color: 'green', message: 'Комментарий сохранён' });
		setText('');
		setOpened(false);
	}, [text, createHistory, userId, organization]);

	return (
		<Popover opened={opened} onChange={setOpened} withArrow shadow="xl" radius="md" width={300} position="bottom-end">
			<Popover.Target>
				<Tooltip label="Быстрый комментарий" withArrow position="top">
					<button className={css.btn} onClick={() => setOpened(true)}>💬</button>
				</Tooltip>
			</Popover.Target>
			<Popover.Dropdown>
				<div className={css.notePopup}>
					<Textarea
						placeholder="Комментарий по организации..."
						value={text}
						onChange={(e) => setText(e.currentTarget.value)}
						size="xs"
						minRows={2}
						autoFocus
					/>
					<Button size="xs" onClick={handleSubmit} loading={isLoading} fullWidth>
						Сохранить
					</Button>
				</div>
			</Popover.Dropdown>
		</Popover>
	);
};
