import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { parseISO, format } from 'date-fns';
import {
	ICalendarEventEntity,
	EnCalendarEventType,
	CalendarEventConst,
	CalendarEventService,
} from '@fsd/entities/calendar-event';
import { useCrmHistoryActions } from '@fsd/entities/crm-history';
import { FetchStatusConvert, FetchStatusIsLoading } from '@fsd/shared/lib/fetch-status';
import { Modal, Button, Input, Textarea, Select, DatePicker } from '@fsd/shared/ui-kit';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import css from './event-edit-modal.module.scss';

interface IProps {
	event: ICalendarEventEntity;
	opened: boolean;
	onClose: () => void;
}

const typeOptions = Object.entries(CalendarEventConst.Type).map(([value, config]) => ({
	value,
	label: config.label,
}));

export const EventEditModal: FC<IProps> = ({ event, opened, onClose }) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const historyActions = useCrmHistoryActions();

	const initialDates = useMemo(() => {
		const dateStart = parseISO(event.dateStart);
		const dateEnd = parseISO(event.dateEnd);
		return {
			dateStart,
			timeStart: format(dateStart, 'HH:mm'),
			dateEnd,
			timeEnd: format(dateEnd, 'HH:mm'),
		};
	}, [event.dateStart, event.dateEnd]);

	const form = useForm({
		initialValues: {
			type: event.type as string,
			title: event.title,
			description: event.description || '',
			dateStart: initialDates.dateStart as Date | null,
			timeStart: initialDates.timeStart,
			dateEnd: initialDates.dateEnd as Date | null,
			timeEnd: initialDates.timeEnd,
		},
		validate: {
			title: (value) => (value.trim().length < 3 ? 'Минимум 3 символа' : null),
			dateStart: (value) => (!value ? 'Укажите дату начала' : null),
			dateEnd: (value) => (!value ? 'Укажите дату окончания' : null),
		},
	});

	useEffect(() => {
		if (opened) {
			form.setValues({
				type: event.type as string,
				title: event.title,
				description: event.description || '',
				dateStart: initialDates.dateStart,
				timeStart: initialDates.timeStart,
				dateEnd: initialDates.dateEnd,
				timeEnd: initialDates.timeEnd,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [opened, event.id]);

	const combineDateAndTime = useCallback((date: Date | null, time: string): Date | undefined => {
		if (!date) return undefined;
		const result = new Date(date);
		if (time) {
			const [hours, minutes] = time.split(':').map(Number);
			result.setHours(hours, minutes, 0, 0);
		}
		return result;
	}, []);

	const [update, { ...updateProps }] = CalendarEventService.update();

	const onSubmit = useCallback(async () => {
		if (form.validate().hasErrors) return;

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

		await update({
			id: event.id,
			data: {
				type: form.values.type,
				title: form.values.title,
				description: form.values.description || undefined,
				dateStart: dateStart.toISOString(),
				dateEnd: dateEnd.toISOString(),
			},
		});
	}, [update, form, event.id, combineDateAndTime]);

	useEffect(() => {
		if (updateProps.status === 'uninitialized') return;
		const status = FetchStatusConvert(updateProps);
		setIsLoading(FetchStatusIsLoading(status));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [updateProps.status]);

	useEffect(() => {
		if (updateProps.error) {
			showNotification({ color: 'red', message: 'Ошибка сохранения события' });
		}
	}, [updateProps.error, updateProps.startedTimeStamp]);

	useEffect(() => {
		if (updateProps.isSuccess) {
			showNotification({ color: 'green', message: 'Событие обновлено' });
			historyActions.reloadTimestamp();
			onClose();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [updateProps.fulfilledTimeStamp, updateProps.isSuccess]);

	return (
		<Modal opened={opened} onClose={onClose} title="Редактирование события" loading={isLoading}>
			<div className={css.form}>
				<div className={css.row}>
					<Select
						label="Тип"
						data={typeOptions}
						disabled={isLoading}
						{...form.getInputProps('type')}
					/>
					<Input
						label="Название события"
						placeholder="Введите название"
						disabled={isLoading}
						{...form.getInputProps('title')}
					/>
				</div>

				<Textarea
					label="Описание"
					placeholder="Описание события (необязательно)"
					disabled={isLoading}
					{...form.getInputProps('description')}
				/>

				<div className={css.row}>
					<DatePicker
						label="Дата начала"
						placeholder="Выберите дату"
						disabled={isLoading}
						{...form.getInputProps('dateStart')}
					/>
					<Input
						label="Время начала"
						type="time"
						disabled={isLoading}
						{...form.getInputProps('timeStart')}
					/>
				</div>

				<div className={css.row}>
					<DatePicker
						label="Дата окончания"
						placeholder="Выберите дату"
						disabled={isLoading}
						minDate={form.values.dateStart || undefined}
						{...form.getInputProps('dateEnd')}
					/>
					<Input
						label="Время окончания"
						type="time"
						disabled={isLoading}
						{...form.getInputProps('timeEnd')}
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
