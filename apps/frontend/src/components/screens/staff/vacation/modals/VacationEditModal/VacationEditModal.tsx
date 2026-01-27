import { FC, useContext, useEffect, useState } from 'react';
import { VacationEditForm } from './vacation-edit.form';
import cn from 'classnames';
import { format, parseISO } from 'date-fns';
import Head from 'next/head';
import { Button, DatePicker, Modal, MultiSelect, Switch, Textarea } from '@fsd/shared/ui-kit';
import { IUserResponse } from '@interfaces/user/UserList.response';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { VacationContext, VacationService } from '@screens/staff/vacation';
import UserService from '@services/User.service';
import { VacationEditModalFormProps, VacationEditModalProps } from '.';
import css from './vacation-edit-modal.module.scss';

export const VacationEditModal: FC<VacationEditModalProps> = ({ data, opened, setOpened, className, ...props }) => {
	const { vacationStore } = useContext(VacationContext);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const form = useForm<VacationEditModalFormProps>();
	const [staff, setStaff] = useState<IUserResponse[]>([]);

	const handleModalClose = () => {
		form.reset();
		setOpened(false);
	};

	const handleSubmit = async () => {
		if (!data) return;
		setIsLoading(true);

		const vacationEditError = await VacationEditForm(form.values);
		if (vacationEditError) {
			vacationEditError.map(({ field, message }) => form.setFieldError(field, message));
			setIsLoading(false);
			return;
		}

		const [, error] = await VacationService.updateById(data.id, {
			dateStart: format(form.values.dateStart, 'yyyy-MM-dd'),
			dateEnd: format(form.values.dateEnd, 'yyyy-MM-dd'),
			comment: form.values.comment,
			isFake: form.values.isFake,
			userId: Number(form.values.userId),
		});

		if (error) {
			showNotification({ color: 'red', message: error.message });
			setIsLoading(false);
			return;
		}

		showNotification({ color: 'green', message: 'Изменения сохранены' });
		vacationStore.getVacations().then();
		setIsLoading(false);
		handleModalClose();
	};

	useEffect(() => {
		setIsLoading(true);
		let isMounted = true;

		(async () => {
			const [responseStaff] = await UserService.findAll();
			if (isMounted && responseStaff?.length) setStaff(responseStaff);
			setIsLoading(false);
		})();

		return () => {
			isMounted = false;
			setIsLoading(false);
		};
	}, []);

	useEffect(() => {
		if (data) {
			form.setFieldValue('userId', String(data.userId));
			form.setFieldValue('dateStart', parseISO(data.dateStart));
			form.setFieldValue('dateEnd', parseISO(data.dateEnd));
			if (data.comment) form.setFieldValue('comment', data.comment);
			form.setFieldValue('isFake', data.isFake);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, opened]);

	return (
		<>
			{opened && (
				<Head>
					<title>Изменение информации о отпуске</title>
				</Head>
			)}

			<Modal
				title={'Изменение информации о отпуске'}
				size={600}
				opened={opened}
				onClose={handleModalClose}
				loading={isLoading}
			>
				<form onSubmit={form.onSubmit(handleSubmit)} className={cn(css.wrapper, className)} {...props}>
					<MultiSelect
						data={staff.map((user) => ({
							value: String(user.id),
							label: `${user.lastName} ${user.firstName}`,
							letters: user.lastName[0] + user.firstName[0],
							color: user.color,
							photo: user.photo,
						}))}
						className={css.staff}
						value={[form.values.userId]}
						error={form.errors.userId}
						onChange={(value) => form.setFieldValue('userId', value.join())}
						label={'Сотрудник'}
						maxSelectedValues={1}
						mode={'staff'}
						color={'white'}
						size={'medium'}
						searchable
						disabled
						clearable
						required
					/>

					<Switch
						label={'Фейк?'}
						className={css.isFake}
						checked={form.values.isFake || false}
						onChange={(value) => form.setFieldValue('isFake', value.currentTarget.checked)}
					/>

					<DatePicker
						label={'Начало'}
						{...form.getInputProps('dateStart')}
						maxDate={form.values.dateEnd}
						required
						className={css.dateStart}
					/>

					<DatePicker
						label={'Конец'}
						{...form.getInputProps('dateEnd')}
						minDate={form.values.dateStart}
						required
						className={css.dateEnd}
					/>

					<Textarea label={'Комментарий'} {...form.getInputProps('comment')} className={css.comment} />

					<Modal.Buttons className={css.buttons}>
						<Button onClick={handleModalClose}>Отмена</Button>
						<Button color={'primary'} variant={'hard'} type={'submit'}>
							Сохранить
						</Button>
					</Modal.Buttons>
				</form>
			</Modal>
		</>
	);
};
