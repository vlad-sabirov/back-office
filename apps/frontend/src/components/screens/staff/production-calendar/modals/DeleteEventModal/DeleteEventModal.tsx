import { FC, useContext, useState } from 'react';
import { format } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { Button, Icon, Modal, TextField } from '@fsd/shared/ui-kit';
import TailwindColors from '@config/tailwind/color';
import { useRoles } from '@hooks';
import { showNotification, updateNotification } from '@mantine/notifications';
import { ProductionCalendarContext } from '../..';
import ProductionCalendarService from '../../ProductionCalendar.service';
import { DeleteEventModalProps } from '.';

export const DeleteEventModal: FC<DeleteEventModalProps> = observer(({ open, setOpen }) => {
	const Store = useContext(ProductionCalendarContext);
	const roles = useRoles();
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleModalClose = () => {
		setOpen(false);
	};

	const handleDelete = async () => {
		const isDelete = roles.includes('admin');
		setIsLoading(true);
		showNotification({
			id: 'production-calendar-add',
			message: 'Удаление',
			color: TailwindColors.primary.main,
			loading: true,
		});

		const [findEvents] = await ProductionCalendarService.findMany({ ctx: Store.targetEvent?.ctx });
		if (findEvents?.length)
			for (const event of findEvents)
				isDelete
					? await ProductionCalendarService.deleteById(event.id)
					: await ProductionCalendarService.hideById(event.id);

		await Store.getEvents();

		setTimeout(() => {
			handleModalClose();
			Store.setModalEventEdit(false);
			updateNotification({
				id: 'production-calendar-add',
				message: 'Праздник удален',
				autoClose: 3000,
				color: 'green',
				loading: false,
			});
			setIsLoading(false);
		}, 1000);
	};

	return (
		<Modal title="Удалить праздник?" opened={open} onClose={handleModalClose} size={520}>
			<TextField>
				Вы пытаетесь удалить праздник: {Store.targetEvent?.title},{' '}
				{!!Store.targetEvent?.dateStart && format(Store.targetEvent?.dateStart, 'yyyy')} года. После удаления,
				вы не сможете его восстановить.
			</TextField>

			<TextField>Вы уверены что хотите удалить этот праздник?</TextField>

			<Modal.Buttons>
				<Button onClick={handleModalClose}>Отмена</Button>

				<Button
					color="error"
					variant="hard"
					iconLeft={<Icon name="trash" />}
					disabled={isLoading}
					onClick={handleDelete}
				>
					Удалить
				</Button>
			</Modal.Buttons>
		</Modal>
	);
});
