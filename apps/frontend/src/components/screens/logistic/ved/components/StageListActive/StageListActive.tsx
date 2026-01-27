import { FC, useContext, useRef } from 'react';
import cn from 'classnames';
import { differenceInHours, format, formatDistance, parseISO } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { AvatarGroup, ContentBlock, Icon, TextField } from '@fsd/shared/ui-kit';
import { customLocaleRu } from '@config/date-fns.locale';
import { MainContext } from '@globalStore';
import { CheckAccessBoolean } from '@helpers/CheckAccess';
import { DateSuffix } from '@helpers/DateSuffix';
import { ScrollArea, Tooltip } from '@mantine/core';
import { stageDates } from '../../cfg';
import { Arrow } from '..';
import { StageListActiveProps } from './props';
import css from './styles.module.scss';
import { useStateSelector } from '@fsd/shared/lib/hooks';

export const StageListActive: FC<StageListActiveProps> = observer(({ data }) => {
	const { modalStore, logisticStore } = useContext(MainContext);
	const viewport = useRef<HTMLDivElement>(null);
	const roles = useStateSelector((state) => state.app.auth.roles);

	if (data && data.length) {
		return (
			<>
				<Arrow viewport={viewport} />
				<ScrollArea type="never" offsetScrollbars viewportRef={viewport} className={css.root}>
					<div className={css.wrapper}>
						{data.map((stage) => (
							<div
								className={cn(css.stage, {
									[css.stage__empty]: stage.orders?.length === 0,
								})}
								key={`stageId${stage.id}`}
							>
								<Tooltip
									label={stage.description}
									width={250}
									multiline
									withArrow
									radius="md"
									position="bottom"
									arrowSize={5}
									transitionDuration={300}
								>
									<div className={css.stageTitle}>
										<TextField>{stage.name}</TextField>
										<Icon name="information-f" />
									</div>
								</Tooltip>

								{stage.orders?.length ? (
									<div>
										{stage.orders.map((order) => {
											const { name, comments, isModification } = order;
											const users = [];
											if (order.performer)
												users.push({
													color: order.performer?.color,
													text: order.performer?.firstName[0] + order.performer?.lastName[0],
													src: order.performer?.photo,
												});
											if (order.author)
												users.push({
													color: order.author?.color,
													text: order.author?.firstName[0] + order.author?.lastName[1],
													src: order.author?.photo,
												});

											const notAuthor: boolean = CheckAccessBoolean(
												[
													'boss',
													'developer',
													'logisticVedOrdersCalculate',
													'logisticVedOrdersVed',
												],
												roles ?? []
											);

											let author = false;
											if (
												CheckAccessBoolean(
													['logisticVedOrdersAuthor'],
													roles ?? []
												) &&
												logisticStore.accessAuthorId.includes(order.authorId)
											)
												author = true;

											const createdAt = parseISO(order.createdAt);
											const updatedAt = parseISO(order.updatedAt);
											const diffHours = differenceInHours(new Date(), updatedAt);

											return (
												<ContentBlock
													key={`orderId${order.id}`}
													className={css.orderCard}
													onClick={() => {
														if (notAuthor || author) {
															logisticStore.setLogisticVedOrderCurrent(order);
															logisticStore
																.getLogisticVedOrderByID(order.id)
																// eslint-disable-next-line max-len
																// eslint-disable-next-line @typescript-eslint/no-empty-function
																.then(() => {});
															modalStore.modalOpen('logisticVedOrderCard', true);
														}
													}}
													style={{
														pointerEvents: notAuthor || author ? undefined : 'none',
														userSelect: notAuthor || author ? undefined : 'none',
														opacity: notAuthor || author ? undefined : '0.5',
													}}
												>
													<TextField className={css.orderCard__name}>{name}</TextField>

													<TextField size="small" className={css.orderCard__date}>
														Заявка от {/* eslint-disable-next-line max-len */}
														{format(createdAt, 'd LLLL, yyyy', {
															locale: customLocaleRu,
														})}{' '}
														года
													</TextField>

													{isModification ? (
														<Tooltip
															label={
																// eslint-disable-next-line max-len
																'Говорит о том, что заявка отправлена менеджеру на доработку.'
															}
															multiline
															withArrow
															openDelay={1000}
															transitionDuration={300}
															position="top-start"
														>
															<div>
																<TextField className={css.orderCard__isModification}>
																	На доработке
																</TextField>
															</div>
														</Tooltip>
													) : null}

													<TextField
														size="small"
														className={cn({
															[css.orderCard__lastUpdate]: true,
															[css.orderCard__lastUpdate__warning]:
																(order.isModification &&
																	diffHours > stageDates.inWorking.warningTime &&
																	diffHours <= stageDates.inWorking.errorTime) ||
																(!order.isModification &&
																	diffHours > stage.warningTime &&
																	diffHours <= stage.errorTime),
															[css.orderCard__lastUpdate__error]:
																(order.isModification &&
																	diffHours > stageDates.inWorking.errorTime) ||
																(!order.isModification && diffHours > stage.errorTime),
														})}
													>
														<Icon name="time" />{' '}
														{formatDistance(updatedAt, new Date(), {
															locale: customLocaleRu,
															addSuffix: true,
														})}
													</TextField>

													{comments?.length ? (
														<TextField size="small" className={css.orderCard__comments}>
															<Icon name="comment" /> {comments?.length}{' '}
															{DateSuffix(comments?.length, [
																'комментарий',
																' комментария',
																' комментариев',
															])}
														</TextField>
													) : null}

													{order.authorId || order.performerId ? (
														<AvatarGroup
															limit={2}
															size="small"
															className={css.orderCard__users}
															data={users}
														/>
													) : null}
												</ContentBlock>
											);
										})}
									</div>
								) : null}
							</div>
						))}
					</div>
				</ScrollArea>
			</>
		);
	}

	return <></>;
});
