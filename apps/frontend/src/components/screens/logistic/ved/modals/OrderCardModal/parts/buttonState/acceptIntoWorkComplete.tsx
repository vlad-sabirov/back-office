import { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Icon, Modal, MultiSelect, TextField } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { Tooltip } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import LogisticService from '@services/Logistic.service';
import NotificationService from '@services/Notification.service';
import UserService from '@services/User.service';
import { useStateSelector } from '@fsd/shared/lib/hooks';

export const LogisticOrderVedCardAcceptIntoWorkComplete = observer((): JSX.Element => {
	const { logisticStore, staffStore } = useContext(MainContext);
	const [performerError, setPerformerError] = useState<string>('');
	const performerList = staffStore.userList.filter((user) => {
		const role = user.roles.filter((role) => role.alias.includes('logisticVedOrdersVed'));
		if (role.length) return true;
	});
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const userId = useStateSelector((state) => state.app.auth.userId);

	const form = useForm({
		initialValues: {
			performerId: '',
		},
	});

	const onSubmit = async () => {
		setIsLoading(true);
		const { performerId } = form.values;

		if (performerId.length === 0) {
			setPerformerError('Укажите ответственного');
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
			title: `Взята в проработку`,
			description: `${author.lastName} ${author.firstName} ${
				author.sex === 'male' ? 'назначил' : 'назначила'
			} ответственного за заявку, который будет ее прорабатывать.`,
			authorId: author.id,
			orderId: order.id,
		});

		const { data: nextStage } = await LogisticService.findStageNextPosition(order.stageId);
		await LogisticService.updateOrderById(order.id, {
			stageId: nextStage.id,
			performerId: Number(performerId),
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
		logisticStore.setModalOrderStage('toRework', false);

		const message =
			`<b>Заявки ВЭД.</b>\n` +
			`Ваша заявка была одобрена ВЭД отделом и к ней прикреплен исполнитель. Заявка принята в работу.\n\n` +
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
			<Tooltip
				label={'Указать ответственного и перенести на следующую стадию'}
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
						onClick={() => logisticStore.setModalOrderStage('setPerformer', true)}
					>
						Назначить ответственного
					</Button>
				</div>
			</Tooltip>

			<Modal
				title="Выбор ответственного"
				opened={logisticStore.modalOrderStage.setPerformer}
				onClose={() => logisticStore.setModalOrderStage('setPerformer', false)}
				size={600}
				loading={isLoading}
			>
				<TextField>
					Назначив ответственного, вы принимаете то, что заявка заполнена правильно. После чего она будет
					автоматически переведена на стадию &quot;в работе&quot;.
				</TextField>

				<MultiSelect
					data={performerList?.map((user) => ({
						value: String(user.id),
						label: `${user.lastName} ${user.firstName}`,
						letters: user.lastName[0] + user.firstName[0],
						color: user.color,
						photo: user.photo,
					}))}
					searchable
					mode="staff"
					label="Руководитель"
					value={form.values.performerId ? [form.values.performerId] : []}
					onChange={(value) => {
						form.setFieldValue('performerId', value.length ? value[value.length - 1] : '');
						setPerformerError('');
					}}
					error={performerError}
				/>

				<Modal.Buttons>
					<Button onClick={() => logisticStore.setModalOrderStage('setPerformer', false)}>Отмена</Button>
					<Button color="primary" variant="hard" onClick={onSubmit}>
						Начать работу над заявкой
					</Button>
				</Modal.Buttons>
			</Modal>
		</>
	);
});
