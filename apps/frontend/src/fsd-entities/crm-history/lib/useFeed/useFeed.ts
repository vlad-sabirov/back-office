import { useCallback, useEffect, useRef, useState } from 'react';
import { formatISO, parseISO, subSeconds } from 'date-fns';
import { concat } from 'lodash';
import { CrmHistoryService, ICrmHistoryEntity } from '@fsd/entities/crm-history';
import { useStateSelector } from '@fsd/shared/lib/hooks';

export const useFeed = ({
	organizationID,
	contactID,
}: {
	organizationID?: (number | string)[];
	contactID?: (number | string)[];
}) => {
	const [feedFetch] = CrmHistoryService.feed();
	const [feed, setFeed] = useState<ICrmHistoryEntity[]>([]);
	const isEnd = useRef<boolean>(false);
	const isFetch = useRef<boolean>(false);
	const isFirstRender = useRef<boolean>(true);
	const reloadTimestamp = useStateSelector((state) => state.crm_history.reloadTimestamp);

	const next = useCallback(async () => {
		if (isEnd.current || isFetch.current) {
			return;
		}
		isFetch.current = true;

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
			const result = concat(old, dataResponse || []);
			return result || [];
		});

		isFetch.current = false;
	}, [contactID, feed, feedFetch, organizationID]);

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
		setFeed([]);
	}, [organizationID, contactID]);

	useEffect(() => {
		if (reloadTimestamp == '42') return;
		setFeed([]);
		isEnd.current = false;
	}, [reloadTimestamp]);

	return { feed, next, isEnd: isEnd.current };
};
