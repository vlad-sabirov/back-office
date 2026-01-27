import { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Icon, Modal, TextField, Textarea } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { Tooltip } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import LogisticService from '@services/Logistic.service';
import NotificationService from '@services/Notification.service';
import UserService from '@services/User.service';
import { useStateSelector } from '@fsd/shared/lib/hooks';

export const LogisticOrderVedCardButtonsToClosed = observer((): JSX.Element => {
	const { logisticStore } = useContext(MainContext);
	const form = useForm({ initialValues: { comment: '' } });
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const userId = useStateSelector((state) => state.app.auth.userId);

	const onSubmit = async () => {
		setIsLoading(true);
		const { comment } = form.values;

		if (comment.length < 4) {
			form.setFieldError('comment', 'Минимум 10 символов');
			setIsLoading(false);
			return;
		}

		const order = logisticStore.logisticVedOrderCurrent;
		const [author] = await UserService.findById(userId ?? 0);
		if (!author || !order) {
			setIsLoading(false);
			return;
		}

		await LogisticService.createHistory({
			title: `Заявка закрыта`,
			description: `${author.lastName} ${author.firstName} ${
				author.sex === 'male' ? 'закрыл' : 'закрыла'
			} заявку. Причина указана в комментарии.`,
			authorId: author.id,
			orderId: order.id,
		});
		await LogisticService.createComment({
			comment: 'Заявка была закрыта, по причине: ' + comment,
			authorId: Number(userId ?? 0),
			orderId: order.id,
		});

		await LogisticService.updateOrderById(order.id, {
			isClose: true,
		});
		await logisticStore.getLogisticVedStageListWithOrderOptions({
			userId: logisticStore.displayOrdersAuthor,
			isClose: logisticStore.displayOrdersClosed,
			isDone: logisticStore.displayOrdersDone,
		});
		await logisticStore.getLogisticVedOrderByID(order.id);

		showNotification({
			color: 'green',
			message: `Вы только что успешно закрыли заявку.`,
		});
		logisticStore.setModalOrderStage('toRework', false);

		const message =
			`<b>Заявки ВЭД.</b>\n` +
			`${author.lastName} ${author.firstName} ${
				author.sex === 'male' ? 'закрыл' : 'закрыла'
			} Вашу заявку. С причиной закрытия, Вы можете ознакомиться в комментарии к заявке.\n\n` +
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

	if (logisticStore.logisticVedOrderCurrent) {
		return (
			<>
				<Modal
					title="Закрытие заявки"
					opened={logisticStore.modalOrderStage.toClose}
					onClose={() => logisticStore.setModalOrderStage('toClose', false)}
					size={600}
					loading={isLoading}
				>
					<form onSubmit={form.onSubmit(onSubmit)}>
						<TextField>
							Укажите причину закрытия заявки. Причина причина будет добавлена к заявке в качестве
							комментария и останется в архиве, что-бы можно было ознакомиться с причиной закрытия заявки
							через какое-то время.
						</TextField>

						<Textarea
							variant="white"
							size="medium"
							label="Причина"
							{...form.getInputProps('comment')}
							required
						/>

						<Modal.Buttons>
							<Button onClick={() => logisticStore.setModalOrderStage('toClose', false)}>Отмена</Button>
							<Button
								color="error"
								variant="hard"
								type="submit"
								disabled={form.values.comment.length < 10}
								iconLeft={<Icon name="trash" />}
							>
								Закрыть заявку
							</Button>
						</Modal.Buttons>
					</form>
				</Modal>

				<Tooltip
					label={'Поместить заявку в архив как закрытую'}
					withArrow
					openDelay={1000}
					transitionDuration={300}
				>
					<div>
						<Button
							color="error"
							size="medium"
							variant="easy"
							iconLeft={<Icon name="trash" />}
							onClick={() => logisticStore.setModalOrderStage('toClose', true)}
						>
							Закрыть
						</Button>
					</div>
				</Tooltip>
			</>
		);
	}

	return <></>;
});
