import { useCallback, useEffect, useRef, useState } from 'react';
import { formatISO, parseISO, subSeconds } from 'date-fns';
import { concat } from 'lodash';
import { CrmHistoryService, ICrmHistoryEntity, EnCrmHistoryTypes } from '@fsd/entities/crm-history';
import { CrmTaskService, ICrmTaskEntity } from '@fsd/entities/crm-task';
import { CalendarEventService, ICalendarEventEntity } from '@fsd/entities/calendar-event';
import { useStateSelector } from '@fsd/shared/lib/hooks';

type CalendarEventFeedItem = ICalendarEventEntity & {
	feedType: EnCrmHistoryTypes.CalendarEvent;
};

type FeedItem =
	| ICrmHistoryEntity
	| (ICrmTaskEntity & { type: EnCrmHistoryTypes.Task })
	| CalendarEventFeedItem;

export const useFeed = ({
	organizationID,
	contactID,
}: {
	organizationID?: (number | string)[];
	contactID?: (number | string)[];
}) => {
	const [feedFetch] = CrmHistoryService.feed();
	const [tasksFetch] = CrmTaskService.getByOrganizationId();
	const [eventsFetch] = CalendarEventService.getByOrganizationId();
	const [feed, setFeed] = useState<FeedItem[]>([]);
	const [tasks, setTasks] = useState<ICrmTaskEntity[]>([]);
	const [events, setEvents] = useState<ICalendarEventEntity[]>([]);
	const tasksLoaded = useRef<boolean>(false);
	const eventsLoaded = useRef<boolean>(false);
	const isEnd = useRef<boolean>(false);
	const isFetch = useRef<boolean>(false);
	const isFirstRender = useRef<boolean>(true);
	const reloadTimestamp = useStateSelector((state) => state.crm_history.reloadTimestamp);

	// Загрузка задач для организации
	const loadTasks = useCallback(async () => {
		if (!organizationID || organizationID.length === 0 || tasksLoaded.current) {
			return [];
		}

		const { data: tasksData } = await tasksFetch(organizationID[0]);
		tasksLoaded.current = true;

		if (tasksData && tasksData.length > 0) {
			setTasks(tasksData);
			return tasksData;
		}
		return [];
	}, [organizationID, tasksFetch]);

	// Загрузка событий календаря для организации
	const loadEvents = useCallback(async () => {
		if (!organizationID || organizationID.length === 0 || eventsLoaded.current) {
			return [];
		}

		try {
			const { data: eventsData } = await eventsFetch(organizationID[0]);
			eventsLoaded.current = true;

			if (eventsData && eventsData.length > 0) {
				setEvents(eventsData);
				return eventsData;
			}
		} catch {
			eventsLoaded.current = true;
		}
		return [];
	}, [organizationID, eventsFetch]);

	const next = useCallback(async () => {
		if (isEnd.current || isFetch.current) {
			return;
		}
		isFetch.current = true;

		// Загружаем задачи и события при первом запросе
		let loadedTasks: ICrmTaskEntity[] = [];
		let loadedEvents: ICalendarEventEntity[] = [];
		if (!tasksLoaded.current) {
			loadedTasks = await loadTasks();
		}
		if (!eventsLoaded.current) {
			loadedEvents = await loadEvents();
		}

		const date = feed[feed.length - 1]?.createdAt
			? formatISO(subSeconds(parseISO(feed[feed.length - 1]?.createdAt), 1))
			: formatISO(new Date());

		const { data: dataResponse, error } = await feedFetch({
			date,
			organizationID: organizationID,
			contactID: contactID,
		});

		if (error || !dataResponse || !dataResponse.length) {
			isEnd.current = true;
		}

		setFeed((old) => {
			// Объединяем историю и задачи
			let historyItems: FeedItem[] = concat(old, dataResponse || []);

			// Если это первая загрузка, добавляем задачи и события
			if (old.length === 0) {
				if (loadedTasks.length > 0) {
					const tasksAsFeedItems: FeedItem[] = loadedTasks.map(task => ({
						...task,
						type: EnCrmHistoryTypes.Task as const,
					}));
					historyItems = concat(historyItems, tasksAsFeedItems);
				}

				if (loadedEvents.length > 0) {
					const eventsAsFeedItems: FeedItem[] = loadedEvents.map(event => ({
						...event,
						feedType: EnCrmHistoryTypes.CalendarEvent as const,
					}));
					historyItems = concat(historyItems, eventsAsFeedItems);
				}
			}

			// Сортируем по дате создания (новые сверху)
			historyItems.sort((a, b) => {
				const dateA = parseISO(a.createdAt);
				const dateB = parseISO(b.createdAt);
				return dateB.getTime() - dateA.getTime();
			});

			return historyItems;
		});

		isFetch.current = false;
	}, [contactID, feed, feedFetch, loadTasks, loadEvents, organizationID]);

	useEffect(() => {
		if (!isFirstRender.current) {
			return;
		} else {
			isFirstRender.current = false;
		}
		next().then();
	}, [next, feed]);

	useEffect(() => {
		isEnd.current = false;
		isFirstRender.current = true;
		tasksLoaded.current = false;
		eventsLoaded.current = false;
		setFeed([]);
		setTasks([]);
		setEvents([]);
	}, [organizationID, contactID]);

	useEffect(() => {
		if (reloadTimestamp == '42') return;
		setFeed([]);
		setTasks([]);
		setEvents([]);
		isEnd.current = false;
		tasksLoaded.current = false;
		eventsLoaded.current = false;
	}, [reloadTimestamp]);

	return { feed, next, isEnd: isEnd.current, tasks, events };
};
