import { useContext, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { Button, Modal, Textarea } from '@fsd/shared/ui-kit';
import { customLocaleRu } from '@config/date-fns.locale';
import { MainContext } from '@globalStore';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import LogisticService from '@services/Logistic.service';
import UserService from '@services/User.service';
import { useStateSelector } from '@fsd/shared/lib/hooks';

export const CommentEditModal = observer((): JSX.Element => {
	const { modalStore, logisticStore } = useContext(MainContext);
	const comment = logisticStore.logisticVedCommentCurrent;
	const userId = useStateSelector((state) => state.app.auth.userId);

	const form = useForm({
		initialValues: { comment: '' },
	});

	useEffect(() => {
		if (!comment) return;
		form.setFieldValue('comment', comment?.comment);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [comment]);

	if (comment) {
		const onSubmit = async () => {
			if (form.values.comment.length < 4) {
				form.setFieldError('comment', 'Минимум 4 символа');
				return;
			}

			const { data: response } = await LogisticService.updateCommentById(comment.id, {
				comment: form.values.comment,
				authorId: comment.authorId ? comment.authorId : 0,
				orderId: comment.orderId ? comment.orderId : 0,
			});

			if (response?.statusCode) {
				showNotification({
					color: 'red',
					message: response.message,
				});
				return;
			}

			const [author] = await UserService.findById(userId ?? 0);
			if (!author) return;

			if (comment.orderId) {
				await LogisticService.createHistory({
					title: `Изменен комментарий`,
					description: `${author.lastName} ${author.firstName} ${
						author.sex === 'male' ? 'изменил' : 'изменила'
					} комментарий к заявке от ${format(parseISO(comment.createdAt), 'd LLLL yyyy, HH:mm', {
						locale: customLocaleRu,
					})}.`,
					secret: `Текст старого комментария: ${comment.comment}`,
					authorId: author.id,
					orderId: comment.orderId,
				});
				await LogisticService.updateOrderById(comment.orderId, { updatedAt: new Date() });
				await logisticStore.getLogisticVedOrderByID(comment.orderId);
			}

			showNotification({
				color: 'green',
				message: `Вы успешно изменили комментарий к заявке ВЭД.`,
			});
			modalStore.modalOpen('logisticCommentVedEdit', false);
		};

		return (
			<Modal
				opened={modalStore.modals.logisticCommentVedEdit}
				onClose={() => modalStore.modalOpen('logisticCommentVedEdit', false)}
				title="Изменение комментария"
				size={450}
			>
				<Head>
					<title>Изменение комментария. Back Office</title>
				</Head>

				<form onSubmit={form.onSubmit(onSubmit)}>
					<Textarea label="Текст комментария" {...form.getInputProps('comment')} required></Textarea>

					<Modal.Buttons>
						<Button onClick={() => modalStore.modalOpen('logisticCommentVedEdit')}>Отмена</Button>

						<Button
							color="primary"
							variant="hard"
							onClick={onSubmit}
							disabled={form?.values?.comment?.length < 4}
						>
							Изменить
						</Button>
					</Modal.Buttons>
				</form>
			</Modal>
		);
	}

	return <></>;
});
