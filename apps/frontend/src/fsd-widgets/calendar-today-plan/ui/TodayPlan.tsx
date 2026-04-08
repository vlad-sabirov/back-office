import { FC, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { format, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Grid, Loader, Text, Button, Modal, Tooltip } from '@mantine/core';
import { CalendarEventService, ICalendarEventEntity, CalendarEventConst, EnCalendarEventType } from '@fsd/entities/calendar-event';
import { ICrmTaskEntity, CrmTaskConst, EnCrmTaskPriority, CrmTaskService } from '@fsd/entities/crm-task';
import { EventDetailModal } from '@fsd/features/calendar-event-detail-modal';
import { TaskDetailModal } from '@fsd/features/crm-task-detail-modal';
import { CalendarEventForm } from '@fsd/widgets/calendar-event-form';
import { ContentBlock, Icon, TextField } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import $api from '@helpers/Api.http';
import css from './TodayPlan.module.scss';

// ─── Событие ────────────────────────────────────────────
const EventItem: FC<{ event: ICalendarEventEntity; onClick?: () => void }> = ({ event, onClick }) => {
	const config = CalendarEventConst.Type[event.type as EnCalendarEventType];
	const timeStr = event.isAllDay ? 'Весь день' : format(new Date(event.dateStart), 'HH:mm');

	return (
		<div className={`${css.item} ${css.itemClickable}`} onClick={onClick}>
			<div className={css.itemTime}>{timeStr}</div>
			<div className={css.itemContent}>
				<div className={css.itemTitle}>{event.title}</div>
				<div className={css.itemSub}>
					{config?.label || event.type}
					{event.organization && ` · ${(event.organization as any).nameRu || (event.organization as any).nameEn}`}
				</div>
			</div>
		</div>
	);
};

// ─── Задача ─────────────────────────────────────────────
const priorityColors: Record<string, string> = {
	[EnCrmTaskPriority.Low]: '#96a2b6',
	[EnCrmTaskPriority.Normal]: '#4f7ff0',
	[EnCrmTaskPriority.High]: '#ffa726',
	[EnCrmTaskPriority.Urgent]: '#f9515a',
};

const TaskItem: FC<{ task: ICrmTaskEntity; onClick?: () => void; isOverdue?: boolean }> = ({ task, onClick, isOverdue }) => {
	const borderColor = isOverdue ? '#f9515a' : (priorityColors[task.priority] || '#4f7ff0');
	const overdueDays = task.deadline ? differenceInDays(new Date(), new Date(task.deadline)) : 0;
	const timeStr = isOverdue
		? `${overdueDays} дн.`
		: (task.deadline ? format(new Date(task.deadline), 'HH:mm') : '—');

	return (
		<div
			className={`${css.item} ${css.itemClickable}`}
			onClick={onClick}
			style={{ borderLeft: `3px solid ${borderColor}`, paddingLeft: 6 }}
		>
			<div className={css.itemTime} style={isOverdue ? { color: '#f9515a' } : undefined}>{timeStr}</div>
			<div className={css.itemContent}>
				<div className={css.itemTitle}>{task.title}</div>
				<div className={css.itemSub}>
					{task.organization && ((task.organization as any).nameRu || (task.organization as any).nameEn)}
				</div>
			</div>
		</div>
	);
};

// ─── Остывающая организация ─────────────────────────────
interface TransitionItem {
	id: number;
	nameRu: string;
	nameEn: string;
	currentStatus: string;
	nextStatus: string;
	daysLeft: number;
}

const statusLabels: Record<string, string> = {
	full: 'Активные', medium: 'Тёплые', low: 'Холодные', empty: 'Забытые',
};

const CoolingItem: FC<{ item: TransitionItem }> = ({ item }) => (
	<div className={css.item} style={{ borderLeft: '3px solid #ffa726', paddingLeft: 6 }}>
		<div className={css.itemTime} style={{ color: '#ffa726' }}>
			{item.daysLeft <= 0 ? 'сегодня' : `${item.daysLeft} дн.`}
		</div>
		<div className={css.itemContent}>
			<div className={css.itemTitle}>{item.nameRu || item.nameEn || 'Без названия'}</div>
			<div className={css.itemSub}>{statusLabels[item.currentStatus]} → {statusLabels[item.nextStatus]}</div>
		</div>
	</div>
);

// ─── Виджет "Мой день" ─────────────────────────────────
export const TodayPlan: FC = observer(() => {
	const [fetchTodayPlan, { data, isLoading }] = CalendarEventService.getTodayPlan();
	const [fetchMyTasks] = CrmTaskService.getMyTasks();

	const [overdueTasks, setOverdueTasks] = useState<ICrmTaskEntity[]>([]);
	const [authoredTasks, setAuthoredTasks] = useState<ICrmTaskEntity[]>([]);
	const [coolingOrgs, setCoolingOrgs] = useState<TransitionItem[]>([]);
	const [activeTab, setActiveTab] = useState<'tasks' | 'orgs'>('tasks');
	const { userId } = useUserDeprecated();

	const [viewingEvent, setViewingEvent] = useState<ICalendarEventEntity | null>(null);
	const [viewingTask, setViewingTask] = useState<ICrmTaskEntity | null>(null);
	const [formModalOpened, setFormModalOpened] = useState(false);
	const [showAllModal, setShowAllModal] = useState(false);

	useEffect(() => { fetchTodayPlan(); }, [fetchTodayPlan]);

	useEffect(() => {
		(async () => {
			try {
				const res = await fetchMyTasks();
				if (res?.data && userId) {
					const now = new Date();
					// Мои просроченные (где я исполнитель)
					setOverdueTasks(
						res.data
							.filter((t: ICrmTaskEntity) => t.deadline && new Date(t.deadline) < now && ['pending', 'in_progress'].includes(t.status))
							.slice(0, 5)
					);
					// Порученные (где я автор, исполнитель — другой)
					setAuthoredTasks(
						res.data
							.filter((t: ICrmTaskEntity) =>
								t.authorId === userId &&
								t.assigneeId !== userId &&
								['pending', 'in_progress'].includes(t.status)
							)
							.sort((a: ICrmTaskEntity, b: ICrmTaskEntity) => {
								const aOverdue = a.deadline && new Date(a.deadline) < now;
								const bOverdue = b.deadline && new Date(b.deadline) < now;
								if (aOverdue && !bOverdue) return -1;
								if (!aOverdue && bOverdue) return 1;
								return 0;
							})
							.slice(0, 5)
					);
				}
			} catch {}
		})();
	}, [fetchMyTasks, userId]);

	useEffect(() => {
		(async () => {
			try {
				const res = await $api.get('/crm/organization/upcoming-transitions');
				if (res.data) setCoolingOrgs(res.data.slice(0, 5));
			} catch {}
		})();
	}, []);

	const todayStr = format(new Date(), "d MMMM, EEEE", { locale: ru });
	const todayEvents = data?.events.length ?? 0;
	const todayTasks = data?.tasks.length ?? 0;
	const totalItems = todayEvents + todayTasks + overdueTasks.length + authoredTasks.length + coolingOrgs.length;
	const totalTaskItems = todayEvents + todayTasks + overdueTasks.length + authoredTasks.length;
	const hasItems = totalItems > 0;

	const dynamicSpan = useMemo(() => {
		return 30;
	}, []);

	const reload = () => fetchTodayPlan();

	return (
		<Grid.Col span={dynamicSpan}>
			<ContentBlock className={css.block}>
				<div className={css.header}>
					<TextField mode="heading" size="small">
						Мой день — {todayStr}
					</TextField>
					<div className={css.tabs}>
						<button
							className={`${css.tab} ${activeTab === 'tasks' ? css.tabActive : ''}`}
							onClick={() => setActiveTab('tasks')}
						>
							📋 Задачи {totalTaskItems > 0 && `(${totalTaskItems})`}
						</button>
						<button
							className={`${css.tab} ${activeTab === 'orgs' ? css.tabActive : ''}`}
							onClick={() => setActiveTab('orgs')}
						>
							🏢 Организации {coolingOrgs.length > 0 && `(${coolingOrgs.length})`}
						</button>
					</div>
					{totalTaskItems > 5 && (
						<Tooltip label="Показать все задачи" withArrow position="left">
							<button className={css.expandBtn} onClick={() => setShowAllModal(true)}>
								<Icon name={'open'} />
							</button>
						</Tooltip>
					)}
				</div>

				{isLoading ? (
					<div className={css.loader}><Loader size="sm" /></div>
				) : activeTab === 'tasks' ? (
					<div className={css.listScroll} key="tab-tasks">
						{!hasItems ? (
							<div className={css.empty}>
								<Icon name="calendar" className={css.emptyIcon} />
								<Text size="sm" color="dimmed">На сегодня ничего не запланировано</Text>
								<Button variant="light" size="xs" compact onClick={() => setFormModalOpened(true)}>
									Добавить задачу
								</Button>
							</div>
						) : (
							<>
								{overdueTasks.length > 0 && (
									<>
										<div className={css.sectionTitle} style={{ color: '#f9515a' }}>🔴 Просроченные ({overdueTasks.length})</div>
										{overdueTasks.map((task) => (
											<TaskItem key={`o_${task.id}`} task={task} isOverdue onClick={() => setViewingTask(task)} />
										))}
									</>
								)}

								<div className={css.sectionTitle} style={{ color: '#4f7ff0' }}>⏰ На сегодня ({todayEvents + todayTasks})</div>
								{data?.events.map((event) => (
									<EventItem key={event.id} event={event} onClick={() => setViewingEvent(event)} />
								))}
								{data?.tasks.map((task) => (
									<TaskItem key={task.id} task={task} onClick={() => setViewingTask(task)} />
								))}
								{todayEvents === 0 && todayTasks === 0 && (
									<div className={css.item}>
										<div className={css.itemContent}>
											<div className={css.itemSub}>Нет запланированных дел</div>
										</div>
									</div>
								)}

								{authoredTasks.length > 0 && (
									<>
										<div className={css.sectionTitle} style={{ color: '#7c4dff' }}>📤 Порученные ({authoredTasks.length})</div>
										{authoredTasks.map((task) => {
											const assignee = task.assignee as any;
											const isOverdue = task.deadline && new Date(task.deadline) < new Date();
											return (
												<div
													key={`a_${task.id}`}
													className={`${css.item} ${css.itemClickable}`}
													onClick={() => setViewingTask(task)}
													style={{ borderLeft: `3px solid ${isOverdue ? '#f9515a' : '#7c4dff'}`, paddingLeft: 6 }}
												>
													<div className={css.itemTime} style={isOverdue ? { color: '#f9515a' } : { color: '#7c4dff' }}>
														{isOverdue
															? `${differenceInDays(new Date(), new Date(task.deadline!))} дн.`
															: (task.deadline ? format(new Date(task.deadline), 'HH:mm') : '—')
														}
													</div>
													<div className={css.itemContent}>
														<div className={css.itemTitle}>{task.title}</div>
														<div className={css.itemSub}>→ {assignee?.firstName || ''} {assignee?.lastName || ''}</div>
													</div>
												</div>
											);
										})}
									</>
								)}

							</>
						)}
					</div>
				) : (
					<div className={css.listScroll} key="tab-orgs">
						{coolingOrgs.length > 0 ? (
							<>
								<div className={css.sectionTitle} style={{ color: '#ffa726' }}>🟠 Скоро сменят статус ({coolingOrgs.length})</div>
								{coolingOrgs.map((item) => (
									<CoolingItem key={`c_${item.id}`} item={item} />
								))}
							</>
						) : (
							<div className={css.empty}>
								<Text size="sm" color="dimmed">Нет остывающих организаций — база в порядке!</Text>
							</div>
						)}
					</div>
				)}
			</ContentBlock>

			<EventDetailModal event={viewingEvent} opened={!!viewingEvent} onClose={() => setViewingEvent(null)} onUpdated={reload} onDeleted={reload} />
			<TaskDetailModal task={viewingTask} opened={!!viewingTask} onClose={() => setViewingTask(null)} onUpdated={reload} onDeleted={reload} />
			<Modal opened={formModalOpened} onClose={() => setFormModalOpened(false)} title="Создание" size="lg">
				<CalendarEventForm defaultDate={new Date()} onSuccess={() => { setFormModalOpened(false); reload(); }} onCancel={() => setFormModalOpened(false)} />
			</Modal>

			<Modal opened={showAllModal} onClose={() => setShowAllModal(false)} title={`Мой день — ${todayStr}`} size="lg">
				<div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
					{overdueTasks.length > 0 && (
						<>
							<div className={css.sectionTitle} style={{ color: '#f9515a' }}>🔴 Просроченные ({overdueTasks.length})</div>
							{overdueTasks.map((task) => (
								<TaskItem key={`mo_${task.id}`} task={task} isOverdue onClick={() => { setShowAllModal(false); setViewingTask(task); }} />
							))}
						</>
					)}
					{(todayEvents > 0 || todayTasks > 0) && (
						<>
							<div className={css.sectionTitle} style={{ color: '#4f7ff0' }}>⏰ На сегодня ({todayEvents + todayTasks})</div>
							{data?.events.map((event) => (
								<EventItem key={`me_${event.id}`} event={event} onClick={() => { setShowAllModal(false); setViewingEvent(event); }} />
							))}
							{data?.tasks.map((task) => (
								<TaskItem key={`mt_${task.id}`} task={task} onClick={() => { setShowAllModal(false); setViewingTask(task); }} />
							))}
						</>
					)}
					{authoredTasks.length > 0 && (
						<>
							<div className={css.sectionTitle} style={{ color: '#7c4dff' }}>📤 Порученные ({authoredTasks.length})</div>
							{authoredTasks.map((task) => {
								const assignee = task.assignee as any;
								const isOver = task.deadline && new Date(task.deadline) < new Date();
								return (
									<div key={`ma_${task.id}`} className={`${css.item} ${css.itemClickable}`} onClick={() => { setShowAllModal(false); setViewingTask(task); }}
										style={{ borderLeft: `3px solid ${isOver ? '#f9515a' : '#7c4dff'}`, paddingLeft: 6 }}>
										<div className={css.itemTime} style={{ color: isOver ? '#f9515a' : '#7c4dff' }}>
											{isOver ? `${differenceInDays(new Date(), new Date(task.deadline!))} дн.` : (task.deadline ? format(new Date(task.deadline), 'HH:mm') : '—')}
										</div>
										<div className={css.itemContent}>
											<div className={css.itemTitle}>{task.title}</div>
											<div className={css.itemSub}>→ {assignee?.firstName || ''} {assignee?.lastName || ''}</div>
										</div>
									</div>
								);
							})}
						</>
					)}
					</div>
			</Modal>
		</Grid.Col>
	);
});
