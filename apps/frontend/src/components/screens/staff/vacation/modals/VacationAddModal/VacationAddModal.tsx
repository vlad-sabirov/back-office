import { FC, useContext, useEffect, useState } from 'react';
import { VacationAddForm } from './vacation-add.form';
import cn from 'classnames';
import { format } from 'date-fns';
import Head from 'next/head';
import { Button, DatePicker, Modal, MultiSelect, Switch, Textarea } from '@fsd/shared/ui-kit';
import { IUserResponse } from '@interfaces/user/UserList.response';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { VacationContext } from '@screens/staff/vacation';
import UserService from '@services/User.service';
import { VacationService } from '../../vacation.service';
import { VacationAddModalFormProps, VacationAddModalProps } from '.';
import css from './vacation-add-modal.module.scss';

export const VacationAddModal: FC<VacationAddModalProps> = ({ opened, setOpened, className, ...props }) => {
	const { vacationStore } = useContext(VacationContext);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const form = useForm<VacationAddModalFormProps>();
	const [staff, setStaff] = useState<IUserResponse[]>([]);

	const handleModalClose = () => {
		setOpened(false);
	};

	const handleSubmit = async () => {
		setIsLoading(true);
		const validationError = await VacationAddForm(form.values);
		if (validationError) {
			validationError.map(({ field, message }) => form.setFieldError(field, message));
			setIsLoading(false);
			return;
		}

		const [, error] = await VacationService.create({
			userId: form.values.userId,
			dateStart: format(form.values.dateStart, 'yyyy-MM-dd'),
			dateEnd: format(form.values.dateEnd, 'yyyy-MM-dd'),
			comment: form.values.comment,
			isFake: form.values.isFake,
		});

		if (error) {
			showNotification({ color: 'red', message: error.message });
			setIsLoading(false);
			return;
		}

		showNotification({ color: 'green', message: 'Отпуск зарегистрирован' });
		vacationStore.getVacations().then();
		setIsLoading(false);
		handleModalClose();
		form.reset();
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

	return (
		<>
			{opened && (
				<Head>
					<title>Добавление отпуска</title>
				</Head>
			)}

			<Modal
				title={'Добавление отпуска'}
				size={460}
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
						clearable
						required
					/>

					<Switch label={'Фейк?'} className={css.isFake} {...form.getInputProps('isFake')} />

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
