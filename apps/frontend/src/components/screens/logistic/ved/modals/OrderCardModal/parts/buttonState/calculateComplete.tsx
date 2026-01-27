import { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Icon, Modal, TextField } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { Tooltip } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import LogisticService from '@services/Logistic.service';
import NotificationService from '@services/Notification.service';
import UserService from '@services/User.service';
import { useStateSelector } from '@fsd/shared/lib/hooks';

export const LogisticOrderVedCardCalculateComplete = observer((): JSX.Element => {
	const { logisticStore } = useContext(MainContext);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const userId = useStateSelector((state) => state.app.auth.userId);

	const onSubmit = async () => {
		setIsLoading(true);

		const order = logisticStore.logisticVedOrderCurrent;
		const [author] = await UserService.findById(userId ?? 0);
		if (!author || !order) {
			setIsLoading(false);
			return;
		}

		await LogisticService.createHistory({
			title: `Закончен расчет заявки`,
			description: `${author.lastName} ${author.firstName} ${
				author.sex === 'male' ? 'закончил' : 'закончила'
			} расчет итоговой стоимости позиций по заявке.`,
			authorId: author.id,
			orderId: order.id,
		});

		const { data: nextStage } = await LogisticService.findStageNextPosition(order.stageId);
		await LogisticService.updateOrderById(order.id, {
			stageId: nextStage.id,
		});
		await logisticStore.getLogisticVedStageListWithOrderOptions({
			userId: logisticStore.displayOrdersAuthor,
			isClose: logisticStore.displayOrdersClosed,
			isDone: logisticStore.displayOrdersDone,
		});
		await logisticStore.getLogisticVedOrderByID(order.id);

		showNotification({
			message: `Вы только что успешно изменили статус заявки.`,
			color: 'green',
		});
		logisticStore.setModalOrderStage('calculate', false);

		const message =
			`<b>Заявки ВЭД.</b>\n` +
			`По Вашей заявке были получены итоговое цены. От Вас ожидается заключение договора .\n\n` +
			// eslint-disable-next-line max-len
			`<a href='${location.hostname}/logistic/ved/${logisticStore.logisticVedOrderCurrent?.id}'>Ссылка на заявку</a>`;

		await NotificationService.sendMessageTelegram({
			chatId: Number(logisticStore.logisticVedOrderCurrent?.author.telegramId),
			message,
		});

		const [parent] = await UserService.findParentByChildId(logisticStore.logisticVedOrderCurrent?.author?.id ?? 0);
		if (parent?.[0]?.telegramId) {
			await NotificationService.sendMessageTelegram({ chatId: Number(parent[0].telegramId), message });
		}

		setIsLoading(false);
	};

	return (
		<>
			<Tooltip label={'Отправить заявку на следующую стадию'} withArrow openDelay={1000} transitionDuration={300}>
				<div>
					<Button
						color="success"
						size="medium"
						variant="easy"
						iconLeft={<Icon name="checkbox" />}
						onClick={() => logisticStore.setModalOrderStage('calculate', true)}
					>
						Дальше, на контрактование
					</Button>
				</div>
			</Tooltip>

			<Modal
				title="Файл заявки изменен?"
				opened={logisticStore.modalOrderStage.calculate}
				onClose={() => logisticStore.setModalOrderStage('calculate', false)}
				size={600}
				loading={isLoading}
			>
				<TextField>Убедитесь что вы уже изменили и загрузили excel файл заявки.</TextField>
				<TextField>
					Если вы его не изменяли и не загружали измененным, то нажмите отмену и выполните необходимые
					действия.
				</TextField>
				<TextField>Если вышеперечисленные действия выполнены, то нажмите &quot;Подтвердить&quot;.</TextField>

				<Modal.Buttons>
					<Button onClick={() => logisticStore.setModalOrderStage('calculate', false)}>Отмена</Button>
					<Button color="primary" variant="hard" onClick={onSubmit}>
						Подтвердить
					</Button>
				</Modal.Buttons>
			</Modal>
		</>
	);
});
