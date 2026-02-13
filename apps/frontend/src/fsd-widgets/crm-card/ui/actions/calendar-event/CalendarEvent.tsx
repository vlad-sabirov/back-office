import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarEventService, EnCalendarEventType, CalendarEventConst } from '@fsd/entities/calendar-event';
import { useCrmHistoryActions } from '@fsd/entities/crm-history';
import { FetchStatusConvert, FetchStatusIsLoading } from '@fsd/shared/lib/fetch-status';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon, Tabs, Textarea, Input, Select, DatePicker } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { useForm } from '@mantine/form';
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

	const form = useForm({
		initialValues: {
			type: EnCalendarEventType.Meeting as string,
			title: '',
			description: '',
			dateStart: null as Date | null,
			timeStart: '10:00',
			dateEnd: null as Date | null,
			timeEnd: '11:00',
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

	const [create, { ...createProps }] = CalendarEventService.create();

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

		await create({
			type: form.values.type,
			title: form.values.title,
			description: form.values.description || undefined,
			dateStart: dateStart.toISOString(),
			dateEnd: dateEnd.toISOString(),
			isAllDay: false,
			authorId: userId || 0,
			assigneeId: assigneeId,
			organizationId: organizationId || undefined,
		});
		historyActions.reloadTimestamp();
	}, [create, form, userId, assigneeId, organizationId, historyActions, combineDateAndTime]);

	useEffect(() => {
		if (createProps.status === 'uninitialized') return;
		const status = FetchStatusConvert(createProps);
		setIsLoading(FetchStatusIsLoading(status));
	}, [createProps.status]);

	useEffect(() => {
		if (createProps.error) {
			const error = createProps.error as any;
			const message = error?.data?.message || error?.message || 'Ошибка создания события';
			showNotification({ color: 'red', message });
		}
	}, [createProps.error, createProps.startedTimeStamp]);

	useEffect(() => {
		if (createProps.isSuccess) {
			showNotification({ color: 'green', message: 'Событие создано' });
			form.reset();
		}
	}, [createProps.fulfilledTimeStamp, createProps.isSuccess]);

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
