import { useContext, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { Button, Icon, Modal, TextField } from '@fsd/shared/ui-kit';
import { customLocaleRu } from '@config/date-fns.locale';
import { MainContext } from '@globalStore';
import { showNotification } from '@mantine/notifications';
import LogisticService from '@services/Logistic.service';
import UserService from '@services/User.service';
import { useStateSelector } from '@fsd/shared/lib/hooks';

export const CommentDeleteModal = observer((): JSX.Element => {
	const { modalStore, logisticStore } = useContext(MainContext);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const userId = useStateSelector((state) => state.app.auth.userId);

	if (logisticStore.logisticVedCommentCurrent) {
		const comment = logisticStore.logisticVedCommentCurrent;

		const onSubmit = async () => {
			setIsLoading(true);
			const [author] = await UserService.findById(userId ?? 0);
			if (!author) return;

			const { data: response } = await LogisticService.deleteCommentById(comment.id);

			if (response?.statusCode) {
				await logisticStore.getLogisticVedStageListWithOrderOptions({
					userId: logisticStore.displayOrdersAuthor,
					isClose: logisticStore.displayOrdersClosed,
					isDone: logisticStore.displayOrdersDone,
				});

				showNotification({
					color: 'red',
					message: `Невозможно удалить указанный комментарий, так как она уже был ранее удален.`,
				});

				modalStore.modalOpen('logisticCommentVedDelete', false);
				setIsLoading(false);
				return;
			}

			if (comment.orderId) {
				await LogisticService.createHistory({
					title: `Удален комментарий`,
					description: `${author.lastName} ${author.firstName} ${
						author.sex === 'male' ? 'удалил' : 'удалила'
					} комментарий к заявке от ${format(parseISO(comment.createdAt), 'd LLLL yyyy, HH:mm', {
						locale: customLocaleRu,
					})}.`,
					secret: `Текст удаленного комментария: ${comment.comment}`,
					authorId: author.id,
					orderId: comment.orderId,
				});
				await LogisticService.updateOrderById(comment.orderId, { updatedAt: new Date() });
				await logisticStore.getLogisticVedOrderByID(comment.orderId);
			}
			showNotification({
				color: 'green',
				message: `Вы успешно удалили комментарий к заявке.`,
			});
			setIsLoading(false);
			modalStore.modalOpen('logisticCommentVedDelete', false);
		};

		return (
			<Modal
				opened={modalStore.modals.logisticCommentVedDelete}
				onClose={() => modalStore.modalOpen('logisticCommentVedDelete', false)}
				title="Удалить комментарий?"
				size={475}
				loading={isLoading}
			>
				<Head>
					<title>Удаление комментария. Back Office</title>
				</Head>

				<TextField>Вы пытаетесь удалить комментарий для заявки ВЭД.</TextField>
				<TextField>
					После его удаления, Вы не сможете восстановить данные. Вы все еще хотите удалить комментарий?
				</TextField>

				<Modal.Buttons>
					<Button onClick={() => modalStore.modalOpen('logisticCommentVedDelete')}>Отмена</Button>

					<Button color="error" variant="hard" onClick={onSubmit}>
						<Icon name="trash" />
						&nbsp;Точно удалить
					</Button>
				</Modal.Buttons>
			</Modal>
		);
	}

	return <></>;
});
