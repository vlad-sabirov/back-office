import { FC, useContext, useEffect, useState } from 'react';
import { format, parse } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { Button, DatePicker, Icon, Input, Modal, Textarea } from '@fsd/shared/ui-kit';
import TailwindColors from '@config/tailwind/color';
import { useForm } from '@mantine/form';
import { showNotification, updateNotification } from '@mantine/notifications';
import { ProductionCalendarContext } from '../..';
import ProductionCalendarService from '../../ProductionCalendar.service';
import { EditEventModalProps } from '.';
import { DeleteEventModal } from '..';
import css from './EditEventModal.module.scss';
import { Divider } from '@mantine/core';

export const EditEventModal: FC<EditEventModalProps> = observer(() => {
	const Store = useContext(ProductionCalendarContext);
	const [modalDeleteOpened, setModalDeleteOpened] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isDisabled, setIsDisabled] = useState<boolean>(false);
	const form = useForm({
		initialValues: {
			name: '' as string,
			description: '' as string,
			dateStart: '' as string,
			dateEnd: '' as string,
			transfer: [] as string[],
		},
	});

	useEffect(() => {
		setIsDisabled(
			!(form.values.name.length > 4 && form.values.dateStart.length > 0 && form.values.dateEnd.length > 0)
		);
	}, [form.values.dateEnd.length, form.values.dateStart.length, form.values.name]);

	useEffect(() => {
		if (Store.targetEvent) {
			const { title, description, dateStart, dateEnd, transfer } = Store.targetEvent;
			form.setFieldValue('name', title);
			if (description) form.setFieldValue('description', description);
			form.setFieldValue('dateStart', format(dateStart, 'yyyy-MM-dd'));
			form.setFieldValue('dateEnd', format(dateEnd, 'yyyy-MM-dd'));

			if (transfer?.length)
				transfer.forEach((event, index) => {
					form.setFieldValue(`transfer.${index}`, format(event.dateStart, 'yyyy-MM-dd'));
				});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [Store.targetEvent]);

	const handleModalClose = () => {
		Store.setModalEventEdit(false);
		form.reset();
	};

	const handleSubmit = async () => {
		if (!Store.targetEvent) return;

		setIsLoading(true);
		showNotification({
			id: 'production-calendar-add',
			message: 'Изменение',
			color: TailwindColors.primary.main,
			loading: true,
		});

		const { name, description, dateStart, dateEnd, transfer } = form.values;

		if (name.length < 4) {
			form.setFieldError('name', 'Не мене 4 символов');
			setIsLoading(false);
			updateNotification({
				id: 'production-calendar-add',
				message: 'Ошибка',
				autoClose: 3000,
				color: 'red',
				loading: false,
			});
			return;
		}

		if (!dateStart.length) {
			form.setFieldError('dateStart', 'Укажите первый день праздника');
			setIsLoading(false);
			updateNotification({
				id: 'production-calendar-add',
				message: 'Ошибка',
				autoClose: 3000,
				color: 'red',
				loading: false,
			});
			return;
		}

		if (!dateEnd.length) {
			form.setFieldError('dateEnd', 'Укажите крайний день праздника');
			setIsLoading(false);
			updateNotification({
				id: 'production-calendar-add',
				message: 'Ошибка',
				autoClose: 3000,
				color: 'red',
				loading: false,
			});
			return;
		}

		const [, error] = await ProductionCalendarService.updateById(Store.targetEvent.id as number, {
			type: 'holiday',
			description,
			name,
			dateStart,
			dateEnd,
		});

		if (error) {
			setIsLoading(false);
			updateNotification({
				id: 'production-calendar-add',
				message: error.message,
				autoClose: 3000,
				color: 'red',
				loading: false,
			});
			return;
		}

		if (Store.targetEvent.transfer?.length)
			for (const event of Store.targetEvent.transfer)
				if (event.id) await ProductionCalendarService.deleteById(event.id);

		if (transfer.length) {
			for (const event of transfer) {
				await ProductionCalendarService.create({
					type: 'transfer',
					ctx: Store.targetEvent.ctx,
					description,
					name,
					dateStart: event,
					dateEnd: event,
				});
			}
		}

		await Store.getEvents();

		setTimeout(() => {
			updateNotification({
				id: 'production-calendar-add',
				message: 'Изменения сохранены',
				autoClose: 3000,
				color: 'green',
				loading: false,
			});
			setIsLoading(false);
			handleModalClose();
		}, 1000);
	};

	return (
		<>
			<Modal title="Изменение праздника" opened={Store.modalEventEdit} onClose={handleModalClose} size={440}>
				<form onSubmit={form.onSubmit(handleSubmit)}>
					<div className={css.wrapper}>
						<Input
							label="Название праздника"
							{...form.getInputProps('name')}
							className={css.name}
							required
							disabled={isLoading}
						/>

						<Textarea
							label="Описание праздника"
							{...form.getInputProps('description')}
							className={css.description}
							disabled={isLoading}
						/>

						<DatePicker
							label="Первый день"
							onChange={(date) => {
								if (date) form.setFieldValue(`dateStart`, format(date, 'yyyy-MM-dd'));
								else form.setFieldValue(`dateStart`, '');
							}}
							value={
								form.values.dateStart.length
									? parse(form.values.dateStart, 'yyyy-MM-dd', new Date())
									: null
							}
							error={form.errors.dateStart}
							maxDate={
								form.values.dateEnd.length
									? parse(form.values.dateEnd, 'yyyy-MM-dd', new Date())
									: undefined
							}
							className={css.dateStart}
							disabled={isLoading}
						/>

						<DatePicker
							label="Крайний день"
							onChange={(date) => {
								if (date) form.setFieldValue(`dateEnd`, format(date, 'yyyy-MM-dd'));
								else form.setFieldValue(`dateEnd`, '');
							}}
							minDate={
								form.values.dateStart.length
									? parse(form.values.dateStart, 'yyyy-MM-dd', new Date())
									: undefined
							}
							value={
								form.values.dateEnd.length ? parse(form.values.dateEnd, 'yyyy-MM-dd', new Date()) : null
							}
							error={form.errors.dateEnd}
							className={css.dateEnd}
							disabled={isLoading}
						/>

						{form.values.dateStart && form.values.dateEnd && (
							<div className={css.transfer}>
								<Divider />
								{[...Array(form.values.transfer.filter((item) => item).length + 1)].map(
									(item, index) => {
										return (
											<DatePicker
												key={index}
												label={index === 0 ? 'Переносы' : undefined}
												value={
													form.values.transfer[index]
														? parse(form.values.transfer[index], 'yyyy-MM-dd', new Date())
														: null
												}
												onChange={(date) => {
													if (date)
														form.setFieldValue(
															`transfer.${index}`,
															format(date, 'yyyy-MM-dd')
														);
													else form.setFieldValue(`transfer.${index}`, undefined);
												}}
												disabled={isLoading}
											/>
										);
									}
								)}
							</div>
						)}
					</div>

					<Modal.Buttons className={css.buttons}>
						<Button
							color="error"
							iconLeft={<Icon name="trash" />}
							onClick={() => setModalDeleteOpened(true)}
						>
							Удалить
						</Button>

						<div></div>

						<Button onClick={handleModalClose}>Отмена</Button>

						<Button
							color="primary"
							variant="hard"
							type="submit"
							disabled={isDisabled || isLoading}
							loaderPosition="right"
						>
							Сохранить
						</Button>
					</Modal.Buttons>
				</form>
			</Modal>

			<DeleteEventModal open={modalDeleteOpened} setOpen={setModalDeleteOpened} />
		</>
	);
});
