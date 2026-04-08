import { FC, useCallback, useMemo, useState } from 'react';
import { CalendarEventService, CalendarParticipantService, EnCalendarEventType, CalendarEventConst } from '@fsd/entities/calendar-event';
import { useCrmHistoryActions } from '@fsd/entities/crm-history';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { ROLE_HIERARCHY, CHILD_TO_HEAD } from '@fsd/shared/lib/role-hierarchy';
import { Button, Icon, Tabs, Textarea, Input, Select, DatePicker } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { useForm } from '@mantine/form';
import { MultiSelect, Group, Button as MantineButton } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { ICalendarEventListProps, ICalendarEventPanelProps } from './calendar-event.props';
import css from './calendar-event.module.scss';

const typeOptions = Object.entries(CalendarEventConst.Type).map(([value, config]) => ({
	value,
	label: config.label,
}));

export const CalendarEventPanel: FC<ICalendarEventPanelProps> = ({ index, disabled }) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const currentOrganization = useStateSelector((state) => state.crm_organization.data.current);
	const currentUserRoles = useStateSelector((state) => state.app.auth.roles) || [];
	const { userId } = useUserDeprecated();
	const historyActions = useCrmHistoryActions();
	const staffAll = useStateSelector((state) => state.staff.data.worked);

	// ID организации
	const organizationId = useMemo(() => {
		return currentOrganization?.id || null;
	}, [currentOrganization]);

	// Менеджер организации (кому назначается событие)
	const assigneeId = useMemo(() => {
		return currentOrganization?.userId || null;
	}, [currentOrganization]);

	// Проверка прав на создание события
	const canCreate = useMemo(() => {
		const isManager = currentOrganization?.userId === Number(userId);
		const hasAdminRole = currentUserRoles.some((role: string) =>
			['boss', 'admin', 'developer', 'crmAdmin'].includes(role)
		);
		return isManager || hasAdminRole;
	}, [currentOrganization?.userId, userId, currentUserRoles]);

	// Определяем отдел текущего пользователя (пара head + child роли)
	const departmentRoles = useMemo(() => {
		const roles: string[] = [];
		for (const role of currentUserRoles) {
			if (ROLE_HIERARCHY[role]) {
				roles.push(role, ROLE_HIERARCHY[role]);
			}
			if (CHILD_TO_HEAD[role]) {
				roles.push(role, CHILD_TO_HEAD[role]);
			}
		}
		return Array.from(new Set(roles));
	}, [currentUserRoles]);

	const staffOptions = useMemo(() => {
		const EXCLUDED_POSITIONS = ['грузчик', 'водитель', 'техничка'];
		const all = (staffAll || []).filter((s: any) =>
			!EXCLUDED_POSITIONS.includes((s.workPosition || '').toLowerCase().trim())
		);
		const toOption = (s: any) => ({
			value: String(s.id),
			label: `${s.lastName || ''} ${s.firstName || ''}`.trim(),
		});

		// boss / admin / developer — все сотрудники
		if (currentUserRoles.some((r: string) => ['boss', 'admin', 'developer'].includes(r))) {
			return all.map(toOption);
		}

		// Остальные — только сотрудники из своего отдела
		if (departmentRoles.length > 0) {
			return all
				.filter((s: any) => {
					if (s.id === Number(userId)) return false; // Исключаем себя
					const staffRoles = (s.roles || []).map((r: any) => r.alias || r);
					return staffRoles.some((r: string) => departmentRoles.includes(r));
				})
				.map(toOption);
		}

		return [];
	}, [staffAll, currentUserRoles, userId, departmentRoles]);

	const form = useForm({
		initialValues: {
			type: EnCalendarEventType.Meeting as string,
			title: '',
			description: '',
			dateStart: null as Date | null,
			timeStart: '10:00',
			dateEnd: null as Date | null,
			timeEnd: '11:00',
			participantIds: [] as string[],
		},
		validate: {
			title: (value) => (value.trim().length < 3 ? 'Минимум 3 символа' : null),
			dateStart: (value) => (!value ? 'Укажите дату начала' : null),
			dateEnd: (value) => (!value ? 'Укажите дату окончания' : null),
		},
	});

	// Комбинируем дату и время
	const combineDateAndTime = useCallback((date: Date | null, time: string): Date | undefined => {
		if (!date) return undefined;
		const result = new Date(date);
		if (time) {
			const [hours, minutes] = time.split(':').map(Number);
			result.setHours(hours, minutes, 0, 0);
		}
		return result;
	}, []);

	const [create] = CalendarEventService.create();
	const [addParticipants] = CalendarParticipantService.addParticipants();

	const onSubmit = useCallback(async () => {
		if (form.validate().hasErrors) return;

		if (!assigneeId) {
			showNotification({ color: 'red', message: 'У организации не назначен менеджер' });
			return;
		}

		const dateStart = combineDateAndTime(form.values.dateStart, form.values.timeStart);
		const dateEnd = combineDateAndTime(form.values.dateEnd, form.values.timeEnd);

		if (!dateStart || !dateEnd) {
			showNotification({ color: 'red', message: 'Укажите даты события' });
			return;
		}

		if (dateEnd <= dateStart) {
			showNotification({ color: 'red', message: 'Дата окончания должна быть позже даты начала' });
			return;
		}

		setIsLoading(true);
		try {
			const created = await create({
				type: form.values.type,
				title: form.values.title,
				description: form.values.description || undefined,
				dateStart: dateStart.toISOString(),
				dateEnd: dateEnd.toISOString(),
				isAllDay: false,
				authorId: userId || 0,
				assigneeId: assigneeId,
				organizationId: organizationId || undefined,
			}).unwrap();

			if (
				form.values.type === EnCalendarEventType.Meeting &&
				form.values.participantIds.length > 0
			) {
				await addParticipants({
					eventId: created.id,
					userIds: form.values.participantIds.map(Number),
				});
			}

			showNotification({ color: 'green', message: 'Событие создано' });
			form.reset();
			historyActions.reloadTimestamp();
		} catch (error: any) {
			const message = error?.data?.message || error?.message || 'Ошибка создания события';
			showNotification({ color: 'red', message });
		} finally {
			setIsLoading(false);
		}
	}, [create, addParticipants, form, userId, assigneeId, organizationId, historyActions, combineDateAndTime]);

	// Если нет прав на создание - показать сообщение
	if (!canCreate) {
		return (
			<Tabs.Panel value={index} className={css.panel}>
				<div className={css.noAccess}>
					Вы можете создавать события только в организациях, где вы являетесь ответственным менеджером
				</div>
			</Tabs.Panel>
		);
	}

	return (
		<Tabs.Panel value={index} className={css.panel}>
			<div className={css.eventWrapper}>
				<div className={css.eventRow}>
					<Select
						label="Тип"
						data={typeOptions}
						className={css.typeSelect}
						disabled={disabled || isLoading}
						{...form.getInputProps('type')}
					/>
					<Input
						label="Название события"
						placeholder="Введите название"
						className={css.titleInput}
						disabled={disabled || isLoading}
						{...form.getInputProps('title')}
					/>
				</div>
				<div className={css.eventRow}>
					<DatePicker
						label="Дата начала"
						placeholder="Выберите дату"
						className={css.dateInput}
						disabled={disabled || isLoading}
						minDate={new Date()}
						{...form.getInputProps('dateStart')}
					/>
					<Input
						label="Время"
						type="time"
						className={css.timeInput}
						disabled={disabled || isLoading}
						{...form.getInputProps('timeStart')}
					/>
					<DatePicker
						label="Дата окончания"
						placeholder="Выберите дату"
						className={css.dateInput}
						disabled={disabled || isLoading}
						minDate={form.values.dateStart || new Date()}
						{...form.getInputProps('dateEnd')}
					/>
					<Input
						label="Время"
						type="time"
						className={css.timeInput}
						disabled={disabled || isLoading}
						{...form.getInputProps('timeEnd')}
					/>
				</div>
				<div className={css.eventRowLast}>
					<Textarea
						label="Описание"
						placeholder="Описание события (необязательно)"
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
				{form.values.type === EnCalendarEventType.Meeting && (
					<div>
						<Group position="apart" mb={4}>
							<span style={{ fontSize: 14, fontWeight: 500 }}>Участники встречи (необязательно)</span>
							<MantineButton
								variant="light"
								size="xs"
								compact
								disabled={disabled || isLoading || staffOptions.length === 0}
								onClick={() => form.setFieldValue('participantIds', staffOptions.map((o) => o.value))}
							>
								Добавить всех
							</MantineButton>
						</Group>
						<MultiSelect
							placeholder="Выберите участников"
							data={staffOptions}
							value={form.values.participantIds}
							onChange={(value) => form.setFieldValue('participantIds', value)}
							searchable
							clearable
							disabled={disabled || isLoading}
							dropdownPosition="top"
						/>
					</div>
				)}
			</div>
		</Tabs.Panel>
	);
};

export const CalendarEventList: FC<ICalendarEventListProps> = ({ index, disabled }) => {
	return (
		<Tabs.Tab icon={<Icon name="calendar" />} value={index} disabled={disabled}>
			Событие
		</Tabs.Tab>
	);
};
