import { FC, useContext, useState } from 'react';
import cn from 'classnames';
import { observer } from 'mobx-react-lite';
import { Button, Textarea } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import LogisticService from '@services/Logistic.service';
import UserService from '@services/User.service';
import { CommentAddProps } from '.';
import css from './styles.module.scss';
import { useStateSelector } from '@fsd/shared/lib/hooks';

export const CommentAdd: FC<CommentAddProps> = observer(({ orderId, className }): JSX.Element => {
	if (orderId) {
		const { logisticStore } = useContext(MainContext);
		const [isLoading, setIsLoading] = useState<boolean>(false);
		const userId = useStateSelector((state) => state.app.auth.userId);

		const form = useForm({
			initialValues: {
				comment: '',
			},
		});

		const onSubmit = async () => {
			setIsLoading(true);
			const { comment } = form.values;

			if (comment.length < 4) {
				form.setFieldError('comment', 'Минимум 4 символа');
				setIsLoading(false);
				return;
			}

			const [author] = await UserService.findById(userId || 0);
			if (author) {
				const { data: response } = await LogisticService.createComment({
					authorId: author.id,
					comment,
					orderId,
				});

				if (!response.statusCode) {
					await LogisticService.createHistory({
						title: 'Добавлен комментарий',
						description: `${author.lastName} ${author.firstName} ${
							author.sex === 'male' ? 'добавил' : 'добавила'
						} комментарий к заявке.`,
						authorId: author.id,
						orderId: orderId,
					});
					await LogisticService.updateOrderById(orderId, { updatedAt: new Date() });

					await logisticStore.getLogisticVedOrderByID(orderId);
					form.reset();
					showNotification({
						message: `Вы успешно добавили комментарий к заявке.`,
						color: 'green',
					});
				}
			}

			setIsLoading(false);
		};

		return (
			<form onSubmit={form.onSubmit(onSubmit)} className={cn(css.root, className)}>
				<Textarea
					label="Написать комментарий"
					className={css.comment}
					{...form.getInputProps('comment')}
					disabled={isLoading}
				/>

				<Button
					color="primary"
					className={css.button}
					disabled={form.values.comment.length < 4}
					type="submit"
					loading={isLoading}
				>
					{isLoading ? 'Отправляется' : 'Отправить'}
				</Button>
			</form>
		);
	}

	return <></>;
});
