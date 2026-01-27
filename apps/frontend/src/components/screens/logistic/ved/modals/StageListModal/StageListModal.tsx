import { FC, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Button, Icon, Menu, Modal, TextField } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { DateSuffix } from '@helpers/DateSuffix';
import { ILogisticVedStageResponse } from '@screens/logistic';
import LogisticService from '@services/Logistic.service';
import css from './styles.module.scss';

export const StageListModal: FC = observer(() => {
	const { modalStore, logisticStore } = useContext(MainContext);

	return (
		<Modal
			title="Стадии заявок ВЭД"
			opened={modalStore.modals.logisticStagesVedList}
			onClose={() => modalStore.modalOpen('logisticStagesVedList', false)}
			size={520}
		>
			{logisticStore.logisticVedStageList?.length ? (
				<DragDropContext
					onDragEnd={(result) => {
						const newStage = Array.from(logisticStore.logisticVedStageList as ILogisticVedStageResponse[]);
						const [removed] = newStage.splice(result.source.index, 1);
						newStage.splice(result.destination?.index as number, 0, removed);
						newStage.map((stage, index) => (newStage[index].position = index));

						LogisticService.resortStage(
							newStage.map((stage) => ({ id: stage.id, position: stage.position }))
						);
						logisticStore.setLogisticVedStageList(newStage);
					}}
				>
					<Droppable droppableId="modalLOgisticStagesVedList">
						{(provided) => (
							<div className={css.root} {...provided.droppableProps} ref={provided.innerRef}>
								{logisticStore.logisticVedStageList?.map((order) => {
									const warningTime = {
										hours: order.warningTime < 24 ? order.warningTime : order.warningTime % 24,
										days: order.warningTime < 24 ? 0 : Math.floor(order.warningTime / 24),
									};
									const errorTime = {
										hours: order.errorTime < 24 ? order.errorTime : order.errorTime % 24,
										days: order.errorTime < 24 ? 0 : Math.floor(order.errorTime / 24),
									};
									return (
										<Draggable draggableId={String(order.id)} index={order.position} key={order.id}>
											{(provided) => (
												<div
													className={css.wrapper}
													{...provided.draggableProps}
													ref={provided.innerRef}
												>
													<TextField className={css.name} {...provided.dragHandleProps}>
														<Icon name="dots-eight" />
														{order.name}
													</TextField>

													<TextField className={css.orderCount}></TextField>

													<Menu
														control={
															<div className={css.menu}>
																<Icon name="dots-three" />
															</div>
														}
													>
														<Menu.Item
															color="blue"
															icon={<Icon name="edit" />}
															onClick={() => {
																logisticStore.setLogisticVedStageCurrent(order);
																modalStore.modalOpen('logisticStagesVedEdit', true);
															}}
														>
															Изменить
														</Menu.Item>
														<Menu.Item
															color="red"
															icon={<Icon name="trash" />}
															onClick={() => {
																logisticStore.setLogisticVedStageCurrent(order);
																modalStore.modalOpen('logisticStagesVedDelete', true);
															}}
														>
															Удалить
														</Menu.Item>
													</Menu>

													<TextField className={css.description}>
														{order.description}
													</TextField>

													<TextField className={css.warningTime}>
														Желтая зона:{' '}
														<span>
															{warningTime.days !== 0 && (
																<>
																	{warningTime.days}{' '}
																	{DateSuffix(warningTime.days, [
																		' день',
																		' дня',
																		' дней',
																	])}
																</>
															)}{' '}
															{warningTime.hours !== 0 && (
																<>
																	{warningTime.hours}{' '}
																	{DateSuffix(warningTime.hours, [
																		' час',
																		' часа',
																		' часов',
																	])}
																</>
															)}
														</span>
													</TextField>

													<TextField className={css.errorTime}>
														Красная зона:{' '}
														<span>
															{errorTime.days !== 0 && (
																<>
																	{errorTime.days}{' '}
																	{DateSuffix(errorTime.days, [
																		' день',
																		' дня',
																		' дней',
																	])}
																</>
															)}{' '}
															{errorTime.hours !== 0 && (
																<>
																	{errorTime.hours}{' '}
																	{DateSuffix(errorTime.hours, [
																		' час',
																		' часа',
																		' часов',
																	])}
																</>
															)}
														</span>
													</TextField>
												</div>
											)}
										</Draggable>
									);
								})}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>
			) : null}
			<Modal.Buttons>
				<Button
					color="success"
					variant="easy"
					iconLeft={<Icon name="plus-large" style={{ width: 12 }} />}
					onClick={() => modalStore.modalOpen('logisticStagesVedAdd', true)}
				>
					Добавить стадию
				</Button>
			</Modal.Buttons>
		</Modal>
	);
});
