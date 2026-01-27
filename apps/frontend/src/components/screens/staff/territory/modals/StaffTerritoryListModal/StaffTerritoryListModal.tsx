/* eslint-disable max-len */
import { FC, useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Avatar, Button, Icon, Menu, Modal, TextField } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { useAccess } from '@hooks';
import { IStaffTerritoryResponse } from '@screens/staff';
import { Access } from '@screens/staff/cfg';
import { UserTerritoryService } from '../..';
import css from './styles.module.scss';
import { MenuItemStaffUser } from '@fsd/shared/ui-kit/menu/items';

export const StaffTerritoryListModal: FC = observer(() => {
	const { modalStore, staffStore } = useContext(MainContext);
	const CheckAccess = useAccess();

	useEffect(() => {
		if (!modalStore.modals.staffTerritoryList) return;
		// eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
		staffStore.getTerritoryList().then((_) => {});
	}, [staffStore, modalStore.modals.staffTerritoryList]);

	return (
		<Modal
			opened={modalStore.modals.staffTerritoryList}
			onClose={() => modalStore.modalOpen('staffTerritoryList', false)}
			title="Список территорий"
			size={510}
		>
			<Head>
				<title>Список территорий. Back Office</title>
			</Head>

			{modalStore.modals.staffTerritoryList && (
				<DragDropContext
					onDragEnd={(result) => {
						const newTerritory = Array.from(staffStore.territoryList as IStaffTerritoryResponse[]);
						const [removed] = newTerritory.splice(result.source.index, 1);
						newTerritory.splice(result.destination?.index as number, 0, removed);
						newTerritory.map((territory, index) => (newTerritory[index].position = index + 1));

						UserTerritoryService.resortTerritory(
							newTerritory.map((territory) => ({
								id: territory.id as number,
								position: territory.position as number,
							}))
							// eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
						).then((_) => {});
						staffStore.setTerritoryList(newTerritory);
					}}
				>
					{staffStore.territoryList && (
						<Droppable droppableId="someId">
							{(provided) => (
								<>
									<div {...provided.droppableProps} ref={provided.innerRef} className={css.wrapper}>
										{staffStore.territoryList &&
											staffStore.territoryList.map((territory, territoryIndex) => (
												<Draggable
													draggableId={String(territory.id)}
													index={territoryIndex}
													key={'territoryId_' + territory.id}
												>
													{(provided) => (
														<div {...provided.draggableProps} ref={provided.innerRef}>
															<div className={css.territory}>
																{CheckAccess(Access.territoryEdit) && (
																	<span
																		{...provided.dragHandleProps}
																		className={css.dragHandle}
																	>
																		<Icon name="dots-eight" />
																	</span>
																)}

																<TextField className={css.territoryName}>
																	{territory.name}
																</TextField>

																<TextField className={css.staffCount} size="small">
																	Штат: {territory.staffCount} чел
																</TextField>

																<TextField
																	className={css.territoryAddress}
																	size="small"
																>
																	Адрес: {territory.address}
																</TextField>

																{territory.users && !!territory.users.length && (
																	<div className={css.staffPeoples}>
																		{territory.users?.map((user) => (
																			<Menu
																				key={`territoryUserId` + user.id}
																				width={250}
																				offset={-20}
																				control={
																					<span style={{ cursor: 'pointer' }}>
																						<Avatar
																							src={user.photo}
																							size="small"
																							color={user.color}
																							text={
																								user.lastName[0] +
																								user.firstName[0]
																							}
																						/>
																					</span>
																				}
																			>
																				<MenuItemStaffUser data={user} />

																				{CheckAccess(Access.territoryEdit) && (
																					<>
																						<Menu.Divider />

																						<Menu.Item
																							color="blue"
																							icon={<Icon name="edit" />}
																							onClick={() => {
																								staffStore
																									.setCurrentUserById(
																										String(user.id)
																									)
																									// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
																									.then((_) => {});
																								modalStore.modalOpen(
																									'staffTerritoryChangeToUser',
																									true
																								);
																							}}
																						>
																							Сменить территорию
																						</Menu.Item>
																					</>
																				)}
																			</Menu>
																		))}
																	</div>
																)}

																{CheckAccess(Access.territoryEdit) && (
																	<Menu
																		control={
																			<span className={css.menu}>
																				<Icon name="dots-three" />
																			</span>
																		}
																	>
																		<Menu.Item
																			icon={<Icon name="edit" />}
																			color="blue"
																			onClick={() => {
																				modalStore.modalOpen(
																					'staffTerritoryEdit',
																					true
																				);
																				staffStore.setTerritoryCurrent(
																					territory
																				);
																			}}
																		>
																			Изменить
																		</Menu.Item>
																		<Menu.Item
																			color="red"
																			icon={<Icon name="trash" />}
																			onClick={() => {
																				modalStore.modalOpen(
																					'staffTerritoryDelete',
																					true
																				);
																				staffStore.setTerritoryCurrent(
																					territory
																				);
																			}}
																		>
																			Удалить
																		</Menu.Item>
																	</Menu>
																)}
															</div>
														</div>
													)}
												</Draggable>
											))}
										{provided.placeholder}
									</div>
								</>
							)}
						</Droppable>
					)}
				</DragDropContext>
			)}

			{CheckAccess(Access.territoryEdit) && (
				<Modal.Buttons>
					<Button
						color="success"
						variant="easy"
						iconLeft={<Icon name="plus-large" style={{ width: 12 }} />}
						onClick={() => {
							modalStore.modalOpen('staffTerritoryAdd', true);
						}}
					>
						Добавить территорию
					</Button>
				</Modal.Buttons>
			)}
		</Modal>
	);
});
