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

export const LogisticOrderVedCardButtonsReworkComplete = observer((): JSX.Element => {
	const { logisticStore } = useContext(MainContext);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const userId = useStateSelector((state) => state.app.auth.userId);

	const onComplete = async () => {
		setIsLoading(true);
		const order = logisticStore.logisticVedOrderCurrent;
		const [author] = await UserService.findById(userId ?? 0);
		if (!author || !order) {
			setIsLoading(false);
			return;
		}

		await LogisticService.createHistory({
			title: `Заявка доработана`,
			description: `${author.lastName} ${author.firstName} ${
				author.sex === 'male' ? 'указал' : 'указала'
			} что заявка была доработана.`,
			authorId: author.id,
			orderId: order.id,
		});

		await LogisticService.updateOrderById(order.id, {
			isModification: false,
		});
		await logisticStore.getLogisticVedStageListWithOrderOptions({
			userId: logisticStore.displayOrdersAuthor,
			isClose: logisticStore.displayOrdersClosed,
			isDone: logisticStore.displayOrdersDone,
		});
		await logisticStore.getLogisticVedOrderByID(order.id);

		showNotification({
			color: 'green',
			message: `Заявка была доработана. Сотруднику ВЭД уже пришло уведомление об этом.`,
		});
		logisticStore.setModalOrderStage('fromReworkToComplete', false);

		const message =
			`<b>Заявки ВЭД.</b>\n` +
			`${author.lastName} ${author.firstName} ${author.sex === 'male' ? 'указал' : 'указала'}, что ${
				author.sex === 'male' ? 'его' : 'ее'
			} заявка доработана. Проверьте.\n\n` +
			// eslint-disable-next-line max-len
			`<a href='${location.hostname}/logistic/ved/${logisticStore.logisticVedOrderCurrent?.id}'>Ссылка на заявку</a>`;

		if (logisticStore.logisticVedOrderCurrent?.performerId) {
			await NotificationService.sendMessageTelegram({
				chatId: Number(logisticStore.logisticVedOrderCurrent.performer?.telegramId),
				message,
			});
		} else {
			const [performers] = await UserService.findByRole('logisticVedOrdersVed');
			if (performers) {
				performers.map(async (user) => {
					await NotificationService.sendMessageTelegram({
						chatId: Number(user.telegramId),
						message,
					});
				});
			}
		}

		setIsLoading(false);
	};

	if (logisticStore.logisticVedOrderCurrent) {
		return (
			<>
				<Modal
					title="Заявка доработана?"
					opened={logisticStore.modalOrderStage.fromReworkToComplete}
					onClose={() => logisticStore.setModalOrderStage('fromReworkToComplete', false)}
					size={600}
					loading={isLoading}
				>
					<TextField>
						Вы уверены что заявка доработана? Давайте для начала вспомним что нужно было сделать.
					</TextField>
					<TextField>
						Прочитать комментарий, с котором заявка была отправлена на доработку, выполнить все условия, при
						необходимости вновь загрузить excel файл, и только потом подтвердить доработку.
					</TextField>
					<Modal.Buttons>
						<Button onClick={() => logisticStore.setModalOrderStage('fromReworkToComplete', false)}>
							Отмена
						</Button>
						<Button color="primary" variant="hard" onClick={onComplete} iconLeft={<Icon name="checkbox" />}>
							Заявка доработана
						</Button>
					</Modal.Buttons>
				</Modal>

				<Tooltip label={'Указать что заявка доработана'} withArrow openDelay={1000} transitionDuration={300}>
					<div>
						<Button
							color="success"
							size="medium"
							variant="easy"
							iconLeft={<Icon name="checkbox" />}
							onClick={() => {
								logisticStore.setModalOrderStage('fromReworkToComplete', true);
							}}
						>
							Заявка доработана
						</Button>
					</div>
				</Tooltip>
			</>
		);
	}

	return <></>;
});
