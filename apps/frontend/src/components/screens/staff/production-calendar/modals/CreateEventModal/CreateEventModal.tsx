import { FC, useContext, useEffect, useState } from 'react';
import { format, parse } from 'date-fns';
import { v4 as uuid } from 'uuid';
import { Button, DatePicker, Input, Modal, Textarea } from '@fsd/shared/ui-kit';
import TailwindColors from '@config/tailwind/color';
import { useForm } from '@mantine/form';
import { showNotification, updateNotification } from '@mantine/notifications';
import { ProductionCalendarContext } from '../..';
import ProductionCalendarService from '../../ProductionCalendar.service';
import { CreateEventModalProps } from '.';
import css from './CreateEventModal.module.scss';
import { Divider } from '@mantine/core';

export const CreateEventModal: FC<CreateEventModalProps> = ({ opened, setOpened }) => {
	const Store = useContext(ProductionCalendarContext);
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

	const handleModalClose = () => {
		setOpened(false);
		form.reset();
	};

	const handleSubmit = async () => {
		setIsLoading(true);
		showNotification({
			id: 'production-calendar-add',
			message: 'Добавление',
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

		const ctx = uuid();

		const [, error] = await ProductionCalendarService.create({
			type: 'holiday',
			ctx,
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

		if (transfer.length) {
			for (const date of transfer) {
				await ProductionCalendarService.create({
					type: 'transfer',
					ctx,
					description,
					name,
					dateStart: date,
					dateEnd: date,
				});
			}
		}

		await Store.getEvents();

		setTimeout(() => {
			updateNotification({
				id: 'production-calendar-add',
				message: 'Успешно добавлено',
				autoClose: 3000,
				color: 'green',
				loading: false,
			});
			setIsLoading(false);
			handleModalClose();
		}, 1000);
	};

	return (
		<Modal title="Добавление праздника" opened={opened} onClose={handleModalClose} size={440}>
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
						error={form.errors.dateEnd}
						className={css.dateEnd}
						disabled={isLoading}
					/>

					{form.values.dateStart && form.values.dateEnd && (
						<div className={css.transfer}>
							<Divider />
							{[...Array(form.values.transfer.filter((item) => item).length + 1)].map((item, index) => {
								return (
									<DatePicker
										label={index === 0 ? 'Переносы' : undefined}
										key={index}
										onChange={(date) => {
											if (date)
												form.setFieldValue(`transfer.${index}`, format(date, 'yyyy-MM-dd'));
											else form.setFieldValue(`transfer.${index}`, undefined);
										}}
										disabled={isLoading}
									/>
								);
							})}
						</div>
					)}
				</div>

				<Modal.Buttons>
					<Button onClick={handleModalClose}>Отмена</Button>
					<Button
						color="primary"
						variant="hard"
						type="submit"
						disabled={isDisabled || isLoading}
						loaderPosition="right"
					>
						Добавить
					</Button>
				</Modal.Buttons>
			</form>
		</Modal>
	);
};
