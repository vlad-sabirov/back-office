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

export const LogisticOrderVedCardButtonsRework = observer((): JSX.Element => {
	const { logisticStore } = useContext(MainContext);
	const form = useForm({ initialValues: { comment: '' } });
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const userId = useStateSelector((state) => state.app.auth.userId);

	const onSubmit = async () => {
		setIsLoading(true);
		const { comment } = form.values;

		if (comment.length < 4) {
			form.setFieldError('comment', 'Минимум 4 символа');
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
			title: `Отправлена на доработку`,
			description: `${author.lastName} ${author.firstName} ${
				author.sex === 'male' ? 'отправил' : 'отправила'
			} заявку на доработку.`,
			authorId: author.id,
			orderId: order.id,
		});
		await LogisticService.createComment({
			comment: 'Заявка была отправлена на доработку по причине: ' + comment,
			authorId: Number(userId ?? 0),
			orderId: order.id,
		});

		await LogisticService.updateOrderById(order.id, {
			isModification: true,
		});
		await logisticStore.getLogisticVedStageListWithOrderOptions({
			userId: logisticStore.displayOrdersAuthor,
			isClose: logisticStore.displayOrdersClosed,
			isDone: logisticStore.displayOrdersDone,
		});
		await logisticStore.getLogisticVedOrderByID(order.id);

		showNotification({
			color: 'green',
			message: `Заявка отправлена на доработку менеджером.`,
		});
		logisticStore.setModalOrderStage('toRework', false);

		const message =
			`<b>Заявки ВЭД.</b>\n` +
			`Ваша заявка была отправлена на доработку. В комментарии к заявке указана причина доработки. ` +
			`Доработайте файл заявки, загрузите его в систему и нажмите зеленую кнопку, свидетельствующую ` +
			`о том что заявка доработана.\n\n` +
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
					title="Отправка на доработку"
					opened={logisticStore.modalOrderStage.toRework}
					onClose={() => logisticStore.setModalOrderStage('toRework', false)}
					size={600}
					loading={isLoading}
				>
					<form onSubmit={form.onSubmit(onSubmit)}>
						<TextField>
							Укажите причину доработки. Причина причина будет добавлена к заявке в качестве комментария.
						</TextField>

						<Textarea
							variant="white"
							size="medium"
							label="Причина"
							{...form.getInputProps('comment')}
							required
						/>

						<Modal.Buttons>
							<Button onClick={() => logisticStore.setModalOrderStage('toRework', false)}>Отмена</Button>
							<Button
								color="primary"
								variant="hard"
								type="submit"
								disabled={form.values.comment.length < 4}
							>
								Отправить на доработку
							</Button>
						</Modal.Buttons>
					</form>
				</Modal>

				<Tooltip
					label={'Отправить заявку на доработку менеджером'}
					withArrow
					openDelay={1000}
					transitionDuration={300}
				>
					<div>
						<Button
							color="warning"
							size="medium"
							variant="easy"
							iconLeft={<Icon name="edit" />}
							onClick={() => {
								logisticStore.setModalOrderStage('toRework', true);
							}}
						>
							На доработку
						</Button>
					</div>
				</Tooltip>
			</>
		);
	}

	return <></>;
});
