import { FC, useEffect, useState } from 'react';
import cn from 'classnames';
import { eachDayOfInterval, endOfMonth, format, formatISO, isAfter, isSameDay, parseISO } from 'date-fns';
import { startOfDay, startOfMonth } from 'date-fns';
import { customLocaleRu } from '@config/date-fns.locale';
import { StaffAvatar } from '@fsd/entities/staff';
import { ContentBlock, Icon, Menu, TablePropsData, TextField } from '@fsd/shared/ui-kit';
import { Table as TableComponent } from '@fsd/shared/ui-kit';
import { MenuItemStaffUser } from '@fsd/shared/ui-kit/menu/items';
import { useUserDeprecated } from '@hooks';
import { LatenessDataResponse } from '@interfaces';
import { SetSkippedLatenessModal, SubCommentAddModal } from '@screens/staff/lateness';
import { SubCommentDeleteModal, SubCommentEditModal } from '@screens/staff/lateness';
import ProductionCalendarService from '@screens/staff/production-calendar/ProductionCalendar.service';
import { VacationService } from '@screens/staff/vacation';
import { TableProps } from '.';
import css from './table.module.scss';

export const Table: FC<TableProps> = ({ data, onSuccess }) => {
	const { data: latenessData, user: latenessUser } = data;
	const { userId, rolesAlias } = useUserDeprecated();
	const [isSkippedModalIsOpen, setIsSkippedModalIsOpen] = useState<boolean>(false);
	const [subCommentAddModalIsOpen, setSubCommentAddModalIsOpen] = useState<boolean>(false);
	const [subCommentEditModalIsOpen, setSubCommentEditModalIsOpen] = useState<boolean>(false);
	const [subCommentDeleteModalIsOpen, setSubCommentDeleteModalIsOpen] = useState<boolean>(false);
	const [currentLateness, setCurrentLateness] = useState<LatenessDataResponse | null>(null);
	const [currentSubComment, setCurrentSubComment] = useState<LatenessDataResponse | null>(null);
	const [currentSubCommentIndex, setCurrentSubCommentID] = useState<number>(0);
	const [holidays, setHolidays] = useState<string[]>([]);
	const [vacations, setVacations] = useState<string[]>([]);
	const [tableData, setTableData] = useState<TablePropsData>({
		header: [
			{ key: 'date', label: 'Дата', width: '175px', verticalAlign: 'top' },
			{ key: 'time', label: 'Время', width: '125px', verticalAlign: 'top' },
			{ key: 'comment', label: 'Комментарий', verticalAlign: 'top' },
			{ key: 'action', label: '' },
		],
		sortKeys: ['date'],
		body: [],
	});

	useEffect(() => {
		if (latenessData.length) {
			const dataRange: Date[] = eachDayOfInterval({
				start: startOfMonth(parseISO(latenessData[0].dateISO)),
				end: endOfMonth(parseISO(latenessData[0].dateISO)),
			});

			setTableData((old) => ({
				...old,
				body: dataRange.map((dateItem) => {
					const findLateness = latenessData.find((latenessItem) =>
						isSameDay(parseISO(latenessItem.dateISO), dateItem)
					);
					const date: Date | null = findLateness ? parseISO(findLateness.dateISO) : null;
					const timeToNumber = date ? Number(format(date, 'HHmmSSS')) : null;
					const isWeekEnd = format(dateItem, 'i') === '6' || format(dateItem, 'i') === '7';
					const isHoliday = holidays.some((itemHoliday) =>
						itemHoliday.includes(format(dateItem, 'yyyy-MM-dd'))
					);
					const isVacation = vacations.some((itemVacation) =>
						itemVacation.includes(format(dateItem, 'yyyy-MM-dd'))
					);
					const isAfterRegister = isAfter(startOfDay(parseISO(latenessUser.createdAt)), dateItem);
					const isAfterDay = isAfter(dateItem, new Date()) || isAfterRegister;
					const isDisabled = isWeekEnd || isAfterDay;

					const handleSkipped = (date: string) => {
						setCurrentLateness({
							user: data.user,
							data: [
								findLateness ?? {
									id: 0,
									type: 'didCome',
									dateISO: date,
									date: '',
									time: '',
									comment: '',
									metaInfo: '',
									isSkipped: false,
								},
							],
						});
						setIsSkippedModalIsOpen(true);
					};

					const handleAdd = (date: string) => {
						setCurrentLateness({
							user: data.user,
							data: [
								findLateness ?? {
									id: 0,
									type: 'didCome',
									dateISO: date,
									date: '',
									time: '',
									comment: '',
									metaInfo: '',
									isSkipped: false,
								},
							],
						});
						setSubCommentAddModalIsOpen(true);
					};

					const DateDisplay = (
						<>
							<TextField className={css.date} disabled={isDisabled || isHoliday}>
								{format(dateItem, 'EEEEEE, d MMMM yyyy', { locale: customLocaleRu })}
							</TextField>
						</>
					);
					const TimeDisplay = isAfterRegister ? (
						<TextField className={css.time} size={'small'} disabled>
							Еще не работал
						</TextField>
					) : isHoliday ? (
						<TextField className={cn(css.time, css.time__isHoliday)} size={'small'}>
							Праздник
						</TextField>
					) : isVacation ? (
						<TextField className={cn(css.time, css.time__isHoliday)} size={'small'}>
							Отпуск
						</TextField>
					) : isAfterDay ? (
						<></>
					) : findLateness?.isSkipped ? (
						<TextField className={cn(css.time, css.time__isSkipped)} size={'small'} disabled={isDisabled}>
							Не учитывается
						</TextField>
					) : findLateness && findLateness.type !== 'didCome' ? (
						<TextField
							className={cn(css.time, {
								[css.time__arrived]: timeToNumber && timeToNumber < 905000,
								[css.time__late]: timeToNumber && timeToNumber >= 905000,
							})}
							disabled={isDisabled}
						>
							{findLateness.time}
						</TextField>
					) : (
						<TextField size={'small'} className={cn(css.time, css.time__didCome)} disabled={isDisabled}>
							Не {latenessUser.sex === 'male' ? 'пришел' : 'пришла'}
						</TextField>
					);

					const CommentDisplay = (
						<>
							{!!findLateness?.comment && (
								<TextField className={css.commentAuthor} disabled={isDisabled}>
									{findLateness.comment}
								</TextField>
							)}

							{!!findLateness?.comments?.length && (
								<div className={css.comments}>
									{findLateness.comments.map((commentItem) => {
										const handleEdit = () => {
											setCurrentSubComment({ user: data.user, data: [findLateness] });
											setCurrentSubCommentID(commentItem.id);
											setSubCommentEditModalIsOpen(true);
										};

										const handleDelete = () => {
											setCurrentSubComment({ user: data.user, data: [findLateness] });
											setCurrentSubCommentID(commentItem.id);
											setSubCommentDeleteModalIsOpen(true);
										};

										return (
											<Menu
												offset={-20}
												key={commentItem.id}
												control={
													<div className={css.comments__item}>
														{!!commentItem.user && (
															<StaffAvatar user={commentItem.user} size={'extraSmall'} />
														)}

														<TextField size={'small'} className={css.comments__text}>
															{commentItem.comment}
														</TextField>
													</div>
												}
											>
												{!!commentItem.user && (
													<MenuItemStaffUser
														data={commentItem.user}
														content={
															userId === commentItem.userId ||
															rolesAlias?.includes('admin') ? (
																<>
																	<Menu.Item
																		icon={<Icon name={'edit'} />}
																		color={'orange'}
																		onClick={handleEdit}
																	>
																		Изменить комментарий
																	</Menu.Item>

																	<Menu.Item
																		icon={<Icon name={'trash'} />}
																		color={'red'}
																		onClick={handleDelete}
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
						</>
					);

					const ActionDisplay = (
						<Menu
							control={
								<div className={css.actionMenu}>
									<Icon name={'dots-three'} />
								</div>
							}
						>
							<Menu.Item
								icon={<Icon name={'time'} />}
								color={'blue'}
								onClick={() => handleSkipped(formatISO(dateItem))}
							>
								{findLateness?.isSkipped ? 'Учитывать опоздание' : 'Не учитывать опоздание'}
							</Menu.Item>

							{!findLateness?.comments?.some((item) => item.userId === userId) && (
								<Menu.Item
									icon={<Icon name={'plus-medium'} style={{ width: 12 }} />}
									color={'orange'}
									onClick={() => handleAdd(formatISO(dateItem))}
								>
									Добавить комментарий
								</Menu.Item>
							)}
						</Menu>
					);

					return {
						date: { output: DateDisplay, index: format(dateItem, 'yyyyMMdd') },
						time: { output: TimeDisplay, index: '' },
						comment: { output: CommentDisplay, index: '' },
						action: { output: ActionDisplay, index: '' },
					};
				}),
			}));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data, latenessData, latenessUser, userId, holidays, vacations]);

	useEffect(() => {
		let isMounted = true;
		(async () => {
			const [holidaysResponse] = await ProductionCalendarService.findBetweenDateRange({
				start: startOfMonth(parseISO(data.data[0].dateISO)),
				end: endOfMonth(parseISO(data.data[0].dateISO)),
			});
			if (holidaysResponse && isMounted) setHolidays(holidaysResponse);

			const [vacationsResponse] = await VacationService.findBetweenDateRange({
				userId: data.user.id,
				start: startOfMonth(parseISO(data.data[0].dateISO)),
				end: endOfMonth(parseISO(data.data[0].dateISO)),
			});
			const findVacations = vacationsResponse
				?.filter((item) => item.userId === latenessUser.id)
				.map((vacationItem) => vacationItem.dates.map((dateItem) => dateItem))
				.flat();
			if (isMounted) setVacations(findVacations?.length ? findVacations : []);
		})();
		return () => {
			isMounted = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data]);

	return (
		<ContentBlock withoutPaddingX>
			<TableComponent data={tableData} />

			<SubCommentEditModal
				data={currentSubComment}
				commentID={currentSubCommentIndex}
				isOpen={subCommentEditModalIsOpen}
				setOpen={setSubCommentEditModalIsOpen}
				onSuccess={onSuccess}
			/>

			<SubCommentDeleteModal
				data={currentSubComment}
				commentID={currentSubCommentIndex}
				isOpen={subCommentDeleteModalIsOpen}
				setOpen={setSubCommentDeleteModalIsOpen}
				onSuccess={onSuccess}
			/>

			<SubCommentAddModal
				data={currentLateness}
				isOpen={subCommentAddModalIsOpen}
				setOpen={setSubCommentAddModalIsOpen}
				onSuccess={onSuccess}
			/>

			<SetSkippedLatenessModal
				data={currentLateness}
				isOpen={isSkippedModalIsOpen}
				setOpen={setIsSkippedModalIsOpen}
				onSuccess={onSuccess}
			/>
		</ContentBlock>
	);
};
