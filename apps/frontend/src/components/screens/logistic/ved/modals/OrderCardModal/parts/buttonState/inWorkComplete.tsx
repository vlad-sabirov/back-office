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

export const LogisticOrderVedCardinWorkComplete = observer((): JSX.Element => {
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
			title: `Закончена проработка заявки`,
			description: `${author.lastName} ${author.firstName} ${
				author.sex === 'male' ? 'закончил' : 'закончила'
			} проработку заявки. Excel файл загружен и отправлен на расчет стоимости.`,
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
			color: 'green',
			message: `Вы только что успешно изменили статус заявки.`,
		});
		logisticStore.setModalOrderStage('inWork', false);

		const message =
			`<b>Заявки ВЭД.</b>\n` +
			`Ваша заявка передвинута на стадию расчета стоимости.\n\n` +
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

		const [calculateUsers] = await UserService.findByRole('logisticVedOrdersCalculate');
		if (calculateUsers) {
			calculateUsers.map(async (user) => {
				await NotificationService.sendMessageTelegram({
					chatId: Number(user.telegramId),
					message:
						`<b>Заявки ВЭД.</b>\n` +
						`К заявке, которую ${
							logisticStore.logisticVedOrderCurrent?.author.sex === 'male' ? 'оформил' : 'оформила'
						} ${logisticStore.logisticVedOrderCurrent?.author.lastName} ${
							logisticStore.logisticVedOrderCurrent?.author.firstName
						} были получены цены. От Вас требуется расчет итоговой стоимости.\n\n` +
						`<a href='${location.hostname}/logistic/ved/${logisticStore.logisticVedOrderCurrent?.id}'>` +
						`Ссылка на заявку</a>`,
				});
			});
		}

		setIsLoading(false);
	};

	return (
		<>
			<Tooltip
				label={'Расчет готов, отправить заявку на следующую стадию'}
				withArrow
				openDelay={1000}
				transitionDuration={300}
			>
				<div>
					<Button
						color="success"
						size="medium"
						variant="easy"
						iconLeft={<Icon name="checkbox" />}
						onClick={() => logisticStore.setModalOrderStage('inWork', true)}
					>
						Дальше, на расчет стоимости
					</Button>
				</div>
			</Tooltip>

			<Modal
				title="Файл расчетов загружен?"
				opened={logisticStore.modalOrderStage.inWork}
				onClose={() => logisticStore.setModalOrderStage('inWork', false)}
				size={600}
				loading={isLoading}
			>
				<TextField>
					Убедитесь что вы уже загрузили excel файл расчетов. Если вы еще не загружали файл расчетов, то
					нажмите отмену и загрузите его в необходимый блок. Если файл загружен, то нажмите
					&quot;Подтвердить&quot;.
				</TextField>

				<Modal.Buttons>
					<Button onClick={() => logisticStore.setModalOrderStage('inWork', false)}>Отмена</Button>
					<Button color="primary" variant="hard" onClick={onSubmit}>
						Подтвердить
					</Button>
				</Modal.Buttons>
			</Modal>
		</>
	);
});
