import { useCallback, useEffect, useRef, useState } from 'react';
import { formatISO, parseISO, subSeconds } from 'date-fns';
import { concat } from 'lodash';
import { CrmHistoryService, ICrmHistoryEntity, EnCrmHistoryTypes } from '@fsd/entities/crm-history';
import { CrmTaskService, ICrmTaskEntity } from '@fsd/entities/crm-task';
import { useStateSelector } from '@fsd/shared/lib/hooks';

type FeedItem = ICrmHistoryEntity | (ICrmTaskEntity & { type: EnCrmHistoryTypes.Task });

export const useFeed = ({
	organizationID,
	contactID,
}: {
	organizationID?: (number | string)[];
	contactID?: (number | string)[];
}) => {
	const [feedFetch] = CrmHistoryService.feed();
	const [tasksFetch] = CrmTaskService.getByOrganizationId();
	const [feed, setFeed] = useState<FeedItem[]>([]);
	const [tasks, setTasks] = useState<ICrmTaskEntity[]>([]);
	const tasksLoaded = useRef<boolean>(false);
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

	const next = useCallback(async () => {
		if (isEnd.current || isFetch.current) {
			return;
		}
		isFetch.current = true;

		// Загружаем задачи при первом запросе
		let loadedTasks: ICrmTaskEntity[] = [];
		if (!tasksLoaded.current) {
			loadedTasks = await loadTasks();
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

			// Если это первая загрузка, добавляем задачи
			if (loadedTasks.length > 0 && old.length === 0) {
				const tasksAsFeedItems: FeedItem[] = loadedTasks.map(task => ({
					...task,
					type: EnCrmHistoryTypes.Task as const,
				}));
				historyItems = concat(historyItems, tasksAsFeedItems);
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
	}, [contactID, feed, feedFetch, loadTasks, organizationID]);

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
		setFeed([]);
		setTasks([]);
	}, [organizationID, contactID]);

	useEffect(() => {
		if (reloadTimestamp == '42') return;
		setFeed([]);
		setTasks([]);
		isEnd.current = false;
		tasksLoaded.current = false;
	}, [reloadTimestamp]);

	return { feed, next, isEnd: isEnd.current, tasks };
};
