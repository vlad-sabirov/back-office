/* eslint-disable max-len */
import { FC, useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Avatar, Button, Icon, Menu, Modal, TextField } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { useAccess } from '@hooks';
import { Tooltip } from '@mantine/core';
import { IStaffDepartmentResponse } from '@screens/staff';
import { Access } from '@screens/staff/cfg';
import { UserDepartmentService } from '../..';
import css from './styles.module.scss';
import { MenuItemStaffUser } from '@fsd/shared/ui-kit/menu/items';

export const StaffDepartmentListModal: FC = observer(() => {
	const CheckAccess = useAccess();
	const { modalStore, staffStore } = useContext(MainContext);

	useEffect(() => {
		if (!modalStore.modals.staffDepartmentList) return;
		staffStore.getDepartmentList();
	}, [staffStore, modalStore.modals.staffDepartmentList]);

	return (
		<Modal
			opened={modalStore.modals.staffDepartmentList}
			onClose={() => modalStore.modalOpen('staffDepartmentList', false)}
			title="Список отделов"
			size={510}
		>
			<Head>
				<title>Список отделов. Back Office</title>
			</Head>
			{modalStore.modals.staffDepartmentList && (
				<DragDropContext
					onDragEnd={(result) => {
						const newDepartmentChild = Array.from(
							staffStore.departmentChildList as IStaffDepartmentResponse[]
						);
						const [removed] = newDepartmentChild.splice(result.source.index, 1);
						newDepartmentChild.splice(result.destination?.index as number, 0, removed);
						newDepartmentChild.map((department, index) => (newDepartmentChild[index].position = index + 1));

						UserDepartmentService.resortDepartment(
							newDepartmentChild.map((department) => ({
								id: department.id as number,
								position: department.position as number,
							}))
						);

						staffStore.setDepartmentChildList(newDepartmentChild);
					}}
				>
					{staffStore.departmentParent && (
						<Droppable droppableId="someId" key={'departmentId_' + staffStore.departmentParent.id}>
							{(provided) => (
								<div {...provided.droppableProps} ref={provided.innerRef}>
									<div className={css.root}>
										{staffStore.departmentParent.users &&
											staffStore.departmentParent.users?.length > 0 &&
											staffStore.departmentParent.users?.map((user) => (
												<Tooltip
													position="top"
													label={`${user.lastName} ${user.firstName} ${user.surName}`}
													sx={{ marginRight: 12 }}
													withArrow
													arrowSize={4}
													radius="md"
													key={`staffUserId` + user.id}
													transitionDuration={300}
												>
													<Avatar
														src={user.photo}
														size="medium"
														color={user.color}
														text={user.lastName[0] + user.firstName[0]}
													/>
												</Tooltip>
											))}
									</div>
									{staffStore.departmentChildList &&
										staffStore.departmentChildList.map((departmentChild, departmentChildIndex) => (
											<Draggable
												draggableId={String(departmentChild.id)}
												index={departmentChildIndex}
												key={'departmentId_' + departmentChild.id}
											>
												{(provided) => (
													<div {...provided.draggableProps} ref={provided.innerRef}>
														<div className={css.department}>
															{CheckAccess(Access.departmentEdit) && (
																<span
																	{...provided.dragHandleProps}
																	className={css.dragHandle}
																>
																	<Icon name="dots-eight" />
																</span>
															)}

															<TextField mode="paragraph" className={css.departmentName}>
																{departmentChild.name}
															</TextField>

															<TextField
																mode="paragraph"
																size="small"
																className={css.staffCount}
															>
																Штат: {departmentChild.staffCount} чел
															</TextField>

															{CheckAccess(Access.departmentEdit) && (
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
																				'staffDepartmentEdit',
																				true
																			);
																			staffStore.setDepartmentCurrent(
																				departmentChild
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
																				'staffDepartmentDelete',
																				true
																			);
																			staffStore.setDepartmentCurrent(
																				departmentChild
																			);
																		}}
																	>
																		Удалить
																	</Menu.Item>
																</Menu>
															)}

															{/* eslint-disable-next-line max-len */}
															{departmentChild.users && !!departmentChild.users.length && (
																<div className={css.staffPeople}>
																	{departmentChild.users?.map((user) => (
																		<Menu
																			key={`departmentUserId` + user.id}
																			offset={-20}
																			width={250}
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

																			{CheckAccess(Access.departmentEdit) && (
																				<>
																					<Menu.Divider />

																					<Menu.Item
																						color="blue"
																						icon={<Icon name="edit" />}
																						onClick={() => {
																							staffStore.setCurrentUserById(
																								String(user.id)
																							);
																							modalStore.modalOpen(
																								'staffDepartmentChangeToUser',
																								true
																							);
																						}}
																					>
																						Сменить отдел
																					</Menu.Item>
																				</>
																			)}
																		</Menu>
																	))}
																</div>
															)}
														</div>
													</div>
												)}
											</Draggable>
										))}
									{provided.placeholder}
								</div>
							)}
						</Droppable>
					)}
				</DragDropContext>
			)}

			{CheckAccess(Access.departmentEdit) && (
				<Modal.Buttons>
					<Button
						color="success"
						variant="easy"
						iconLeft={<Icon name="plus-large" style={{ width: 12 }} />}
						onClick={() => {
							modalStore.modalOpen('staffDepartmentAdd', true);
						}}
					>
						Добавить отдел
					</Button>
				</Modal.Buttons>
			)}
		</Modal>
	);
});
