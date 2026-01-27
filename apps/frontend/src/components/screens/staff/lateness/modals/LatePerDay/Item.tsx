/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FC, useContext, useState } from 'react';
import cn from 'classnames';
import { format, parseISO } from 'date-fns';
import { customLocaleRu } from '@config/date-fns.locale';
import { LatenessAccess } from '@fsd/entities/lateness';
import { StaffAvatar } from '@fsd/entities/staff';
import { Icon, Menu, TextField } from '@fsd/shared/ui-kit';
import { MenuItemStaffUser } from '@fsd/shared/ui-kit/menu/items';
import { useAccess, useUserDeprecated } from '@hooks';
import { LatenessDataResponse } from '@interfaces';
import { LatenessPerDayContext } from '@screens/staff/lateness/components';
import { ItemProps } from './item.props';
import css from './item.module.scss';

export const Item: FC<ItemProps> = ({ data, className, ...props }) => {
	const componentStore = useContext(LatenessPerDayContext);
	const { userId, rolesAlias } = useUserDeprecated();
	const CheckAccess = useAccess();
	const [isActive, setIsActive] = useState<boolean>(false);
	const { user, data: lateData } = data;

	const handleActiveToggle = () => setIsActive((old) => !old);

	const handleEditComment = (lateness: LatenessDataResponse) => {
		componentStore.setModalCommentEditIsOpen(true);
		componentStore.setCurrentLateness(lateness);
	};

	const handleAddSubComment = () => {
		componentStore.setModalSubCommentAddIsOpen(true);
		componentStore.setCurrentLateness(data);
	};

	const handleEditSubComment = (id: number) => {
		componentStore.setModalSubCommentEditIsOpen(true);
		componentStore.setModalSubCommentID(id);
		componentStore.setCurrentLateness(data);
	};

	const handleDeleteSubComment = (id: number) => {
		componentStore.setModalSubCommentDeleteIsOpen(true);
		componentStore.setModalSubCommentID(id);
		componentStore.setCurrentLateness(data);
	};

	const handleSetSkipped = (lateness: LatenessDataResponse) => {
		componentStore.setModalSetSkippedIsOpen(true);
		componentStore.setCurrentLateness(lateness);
	};

	return (
		<div className={cn(css.item, { [css.item__active]: isActive }, className)} {...props}>
			<Menu
				offset={-20}
				position={'bottom-end'}
				control={
					<div className={css.item__wrapper}>
						<StaffAvatar user={user} className={css.avatar} size={isActive ? 'small' : 'medium'} />

						<div>
							<TextField className={css.name} size={isActive ? 'small' : 'medium'}>
								{user.lastName} {user.firstName}{' '}
								<span className={css.name__date}>({lateData[0].time})</span>
								{lateData[0].isSkipped && <span className={css.name__isSkipped}>Не учитывается</span>}
							</TextField>

							<TextField size={'small'} className={css.commentUser}>
								{lateData[0].comment}
							</TextField>
						</div>

						{!!data.data[0].comments?.length && (
							<div
								className={cn(css.commentCount)}
								onClick={(event) => {
									event.preventDefault();
									event.stopPropagation();
									handleActiveToggle();
								}}
							>
								<Icon name={'comment'} />{' '}
								<TextField size={'small'}>{data.data[0].comments?.length}</TextField>
							</div>
						)}
					</div>
				}
			>
				<MenuItemStaffUser
					data={user}
					content={
						<>
							{CheckAccess(LatenessAccess.setSkippedLateness) && (
								<Menu.Item
									icon={<Icon name={'time'} />}
									color={'blue'}
									onClick={() => handleSetSkipped(data)}
								>
									{data.data[0].isSkipped ? 'Учитывать' : 'Не учитывать'} в табеле опозданий
								</Menu.Item>
							)}

							{(user.id === userId || rolesAlias?.includes('admin')) && (
								<Menu.Item
									icon={<Icon name={'edit'} />}
									color={'blue'}
									onClick={() => handleEditComment(data)}
								>
									Изменить {user.id !== userId ? 'комментарий сотрудника' : 'свой комментарий'}
								</Menu.Item>
							)}

							{!!data.data[0].comments?.length && (
								<Menu.Item
									icon={<Icon name={'comment'} />}
									iconRight={
										<Icon
											name={'arrow-medium'}
											style={{ width: 8, transform: isActive ? 'rotate(180deg)' : undefined }}
										/>
									}
									onClick={handleActiveToggle}
								>
									{!isActive ? 'Показать' : 'Скрыть'}{' '}
									{data.data[0].comments?.length > 1 ? 'комментарии' : 'комментарий'}
								</Menu.Item>
							)}

							{(!data.data[0].comments?.length ||
								!data.data[0].comments.some((comment) => comment.userId === userId)) &&
								CheckAccess(LatenessAccess.addSubComment) && (
									<Menu.Item
										color={'orange'}
										icon={<Icon name={'plus-medium'} style={{ width: 12, margin: '0px 2px' }} />}
										onClick={handleAddSubComment}
									>
										Добавить свой комментарий
									</Menu.Item>
								)}
						</>
					}
				/>
			</Menu>

			<div className={cn(css.commentsWrapper, { hide: !isActive })}>
				{!!data.data[0].comments?.length && (
					<div className={css.comments__wrapper}>
						{data?.data[0]?.comments?.map((comment) => {
							const isEditable = userId === comment.userId || rolesAlias?.includes('admin');
							return (
								<Menu
									key={comment.id}
									offset={-20}
									control={
										<div
											key={comment.id}
											className={css.comments__item}
											onClick={() => {
												if (!isEditable) return;
												// handleEditSubComment(commentIndex);
											}}
										>
											<StaffAvatar
												user={comment.user!}
												size={'extraSmall'}
												className={css.comments__avatar}
											/>

											<TextField size={'small'} className={css.comments__comment}>
												{comment.comment}
											</TextField>

											<TextField size={'small'} className={css.comments__date}>
												{format(parseISO(comment.createdAt), 'd MMMM, yyyyг', {
													locale: customLocaleRu,
												})}
											</TextField>
										</div>
									}
								>
									{comment.user && (
										<MenuItemStaffUser
											data={comment.user}
											content={
												comment.userId === userId || rolesAlias?.includes('admin') ? (
													<>
														<Menu.Item
															color={'orange'}
															icon={<Icon name={'edit'} />}
															onClick={() => handleEditSubComment(comment.id)}
														>
															Изменить комментарий
														</Menu.Item>

														<Menu.Item
															color={'red'}
															icon={<Icon name={'trash'} />}
															onClick={() => handleDeleteSubComment(comment.id)}
														>
															Удалить комментарий
														</Menu.Item>
													</>
												) : undefined
											}
										/>
									)}
								</Menu>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};
