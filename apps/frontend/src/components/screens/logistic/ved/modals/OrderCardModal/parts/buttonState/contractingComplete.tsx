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

export const LogisticOrderVedCardContractingComplete = observer((): JSX.Element => {
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
			title: `Контракт оплачен`,
			description: `${author.lastName} ${author.firstName} ${
				author.sex === 'male' ? 'подтвердил' : 'подтвердила'
			} что был заключен и оплачен договор с клиентом.`,
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
		logisticStore.setModalOrderStage('contracting', false);

		await NotificationService.sendMessageTelegram({
			chatId: Number(logisticStore.logisticVedOrderCurrent?.performer?.telegramId),
			message:
				`<b>Заявки ВЭД.</b>\n` +
				`${logisticStore.logisticVedOrderCurrent?.author.lastName} ${
					logisticStore.logisticVedOrderCurrent?.author.firstName
				} ${
					logisticStore.logisticVedOrderCurrent?.author.sex === 'male' ? 'указал' : 'указала'
				} что договор по ${
					logisticStore.logisticVedOrderCurrent?.author.sex === 'male' ? 'его' : 'ее'
				} заявке был оплачен. Ожидается доставка.\n\n` +
				// eslint-disable-next-line max-len
				`<a href='${location.hostname}/logistic/ved/${logisticStore.logisticVedOrderCurrent?.id}'>Ссылка на заявку</a>`,
		});

		setIsLoading(false);
	};

	return (
		<>
			<Tooltip
				label={'Контракт оплачен, отправить заявку на следующую стадию'}
				withArrow
				multiline
				width={250}
				openDelay={1000}
				transitionDuration={300}
			>
				<div>
					<Button
						color="success"
						size="medium"
						variant="easy"
						iconLeft={<Icon name="checkbox" />}
						onClick={() => logisticStore.setModalOrderStage('contracting', true)}
					>
						Дальше, к доставке
					</Button>
				</div>
			</Tooltip>

			<Modal
				title="Контракт оплачен?"
				opened={logisticStore.modalOrderStage.contracting}
				onClose={() => logisticStore.setModalOrderStage('contracting', false)}
				size={600}
				loading={isLoading}
			>
				<TextField>
					Убедитесь что контракт оплачен клиентом, и только в этом случае нажмите &quot;Подтвердить&quot;.
				</TextField>

				<Modal.Buttons>
					<Button onClick={() => logisticStore.setModalOrderStage('contracting', false)}>Отмена</Button>
					<Button color="primary" variant="hard" onClick={onSubmit}>
						Подтвердить
					</Button>
				</Modal.Buttons>
			</Modal>
		</>
	);
});
