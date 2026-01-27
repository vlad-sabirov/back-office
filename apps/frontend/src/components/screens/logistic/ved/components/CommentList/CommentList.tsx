import { FC, useContext } from 'react';
import { format, formatDistance, parseISO } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { Avatar, Icon, Menu, TextField } from '@fsd/shared/ui-kit';
import { customLocaleRu } from '@config/date-fns.locale';
import { MainContext } from '@globalStore';
import { CommentDeleteModal, CommentEditModal } from '../../modals';
import { CommentListProps } from './props';
import css from './styles.module.scss';

export const CommentList: FC<CommentListProps> = observer(({ data }) => {
	const { logisticStore, modalStore } = useContext(MainContext);

	return (
		<div className={css.root}>
			{data && data.length ? (
				data.map((comment) => {
					if (comment.author)
						return (
							<div className={css.wrapper} key={`commentId${comment.id}`}>
								<Avatar
									color={comment.author.color}
									text={comment.author.lastName[0] + comment.author.lastName[0]}
									src={comment.author.photo}
									size="small"
									className={css.authorPhoto}
								/>

								<div className={css.authorNDate}>
									<TextField className={css.authorNDate__name}>
										{comment.author.lastName} {comment.author.firstName}
									</TextField>

									<TextField size="small" className={css.authorNDate__date}>
										Создан{' '}
										{format(parseISO(comment.createdAt), 'd LLL yyyy, HH:mm', {
											locale: customLocaleRu,
										})}
										{comment.createdAt !== comment.updatedAt ? (
											<span className={css.authorNDate__isEdited}>
												. Изменен{' '}
												{formatDistance(parseISO(comment.createdAt), new Date(), {
													locale: customLocaleRu,
													addSuffix: true,
												})}
											</span>
										) : null}
									</TextField>
								</div>

								<Menu
									className={css.menu}
									control={<Icon name="dots-three" className={css.menu__icon} />}
								>
									<Menu.Item
										color="blue"
										icon={<Icon name="edit" />}
										onClick={() => {
											logisticStore.setLogisticVedCommentCurrent(comment);
											modalStore.modalOpen('logisticCommentVedEdit', true);
										}}
									>
										Изменить
									</Menu.Item>
									<Menu.Item
										color="red"
										icon={<Icon name="trash" />}
										onClick={() => {
											logisticStore.setLogisticVedCommentCurrent(comment);
											modalStore.modalOpen('logisticCommentVedDelete', true);
										}}
									>
										Удалить
									</Menu.Item>
								</Menu>

								<TextField className={css.body}>{comment.comment}</TextField>
							</div>
						);
				})
			) : (
				<TextField mode="paragraph" size="large" className="tabEmpty">
					Комментариев нет
				</TextField>
			)}

			<CommentDeleteModal />
			<CommentEditModal />
		</div>
	);
});
