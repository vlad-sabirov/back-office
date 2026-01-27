import { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon, Modal, TextField, Textarea } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { useUserDeprecated } from '@hooks';
import { Tooltip } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import LogisticService from '@services/Logistic.service';
import NotificationService from '@services/Notification.service';
import UserService from '@services/User.service';

export const LogisticOrderVedCardDeliveryComplete = observer((): JSX.Element => {
	const { logisticStore, modalStore } = useContext(MainContext);
	const { user } = useUserDeprecated();
	const [returnBackModal, setReturnBackModal] = useState<boolean>(false);
	const [returnBackComment, setReturnBackComment] = useState<string>('');
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
			title: `Заявка завершена`,
			description: `${author.lastName} ${author.firstName} ${
				author.sex === 'male' ? 'завершил' : 'завершила'
			} заявку. Работа по заявке окончена.`,
			authorId: author.id,
			orderId: order.id,
		});

		await LogisticService.findStageNextPosition(order.stageId);
		await LogisticService.updateOrderById(order.id, { isDone: true });
		await logisticStore.getLogisticVedStageListWithOrderOptions({
			userId: logisticStore.displayOrdersAuthor,
			isClose: logisticStore.displayOrdersClosed,
			isDone: logisticStore.displayOrdersDone,
		});
		await logisticStore.getLogisticVedOrderByID(order.id);

		showNotification({
			color: 'green',
			message: `Вы только что успешно завершили работу по заявке. Заявка закрыта.`,
		});
		logisticStore.setModalOrderStage('delivery', false);

		const message =
			`<b>Заявки ВЭД.</b>\n` +
			`Товар по Вашей заявке доставлен.\n\n` +
			// eslint-disable-next-line max-len
			`<a href='${location.hostname}/logistic/ved/${logisticStore.logisticVedOrderCurrent?.id}'>Ссылка на заявку</a>`;

		await NotificationService.sendMessageTelegram({
			chatId: Number(logisticStore.logisticVedOrderCurrent?.author?.telegramId),
			message,
		});

		const [parent] = await UserService.findParentByChildId(logisticStore.logisticVedOrderCurrent?.author?.id ?? 0);
		if (parent?.[0]?.telegramId) {
			await NotificationService.sendMessageTelegram({ chatId: Number(parent[0].telegramId), message });
		}

		setIsLoading(false);
	};

	const handleReturnBack = async () => {
		const order = logisticStore.logisticVedOrderCurrent;
		const [author] = await UserService.findById(userId ?? 0);
		if (!author || !order) return;
		const [prevStage] = await LogisticService.findStagePrevPosition(order.stageId);
		if (!prevStage) return;

		await LogisticService.createHistory({
			title: `Заявка возвращена на контрактование`,
			description: `${author.lastName} ${author.firstName} ${
				author.sex === 'male' ? 'вернул' : 'вернула'
			} заявку со стадии Доставка на стадию контрактования. Причина указана в комментарии.`,
			authorId: author.id,
			orderId: order.id,
		});

		await LogisticService.createComment({
			comment: 'Причина возврата на стадию контрактования: ' + returnBackComment,
			authorId: Number(userId ?? 0),
			orderId: order.id,
		});

		await LogisticService.updateOrderById(order.id, { stageId: prevStage.id });
		await logisticStore.getLogisticVedStageListWithOrderOptions({
			userId: logisticStore.displayOrdersAuthor,
			isClose: logisticStore.displayOrdersClosed,
			isDone: logisticStore.displayOrdersDone,
		});
		await logisticStore.getLogisticVedOrderByID(order.id);

		showNotification({
			message: `Заявка была возвращена на предыдущую стадию.`,
			color: 'green',
		});
		setReturnBackModal(false);
		modalStore.modalOpen('logisticVedOrderCard', false);

		await NotificationService.sendMessageTelegram({
			chatId: Number(logisticStore.logisticVedOrderCurrent?.author?.telegramId),
			message:
				`<b>Заявки ВЭД.</b>\n` +
				`Заявка была возвращена на стадию контрактования. Причина указана в комментарии заявки.\n\n` +
				// eslint-disable-next-line max-len
				`<a href='${location.hostname}/logistic/ved/${logisticStore.logisticVedOrderCurrent?.id}'>Ссылка на заявку</a>`,
		});
	};

	return (
		<>
			<Tooltip
				label={'Возвращает заявку на предыдущую стадию'}
				withArrow
				openDelay={1000}
				transitionDuration={300}
			>
				<div>
					<Button
						color="info"
						variant="hard"
						iconLeft={<Icon name="drawer" />}
						onClick={() => setReturnBackModal(true)}
					>
						Вернуть
					</Button>
				</div>
			</Tooltip>

			<Tooltip
				label={'Поместить заявку в архив как успешно завершенную'}
				withArrow
				openDelay={1000}
				transitionDuration={300}
			>
				<div>
					<Button
						color="success"
						size="extraLarge"
						variant="hard"
						iconLeft={<Icon name="checkbox" />}
						onClick={() => logisticStore.setModalOrderStage('delivery', true)}
					>
						Доставлено
					</Button>
				</div>
			</Tooltip>

			<Modal
				title="Товар на складе?"
				opened={logisticStore.modalOrderStage.delivery}
				onClose={() => logisticStore.setModalOrderStage('delivery', false)}
				size={600}
				loading={isLoading}
			>
				<TextField>
					Вы уверены что товар уже на складе? Заявку можно завершить, только при доставленном товаре.
				</TextField>

				<Modal.Buttons>
					<Button onClick={() => logisticStore.setModalOrderStage('delivery', false)}>Отмена</Button>
					<Button color="success" variant="hard" onClick={onSubmit}>
						Завершить заявку
					</Button>
				</Modal.Buttons>
			</Modal>

			<Modal title="Вернуть назад?" opened={returnBackModal} onClose={() => setReturnBackModal(false)} size={440}>
				<TextField>
					Ты {user?.sex === 'male' ? 'уверен' : 'уверена'} что хочешь вернуть заявку на стадию контрактования?
					Если да, то обязательно оставь комментарий для автора заявки, в котором укажи причину этого решения.
				</TextField>

				<br />

				<Textarea
					label="Комментарий"
					value={returnBackComment}
					onChange={(event) => setReturnBackComment(event.currentTarget.value)}
					required
				></Textarea>

				<Modal.Buttons>
					<Button onClick={() => logisticStore.setModalOrderStage('delivery', false)}>Отмена</Button>
					<Button
						color="primary"
						variant="hard"
						onClick={handleReturnBack}
						disabled={returnBackComment.length < 8}
					>
						Подтвердить
					</Button>
				</Modal.Buttons>
			</Modal>
		</>
	);
});
