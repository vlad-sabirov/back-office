import { FC } from 'react';
import * as Item from './items';
import { Skeleton } from './skeleton/Skeleton';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import TailwindColors from '@config/tailwind/color';
import { CrmHistoryConst, EnCrmHistoryTypes } from '@fsd/entities/crm-history';
import { useFeed } from '@fsd/entities/crm-history/lib/useFeed/useFeed';
import { useAccess, useStateSelector } from '@fsd/shared/lib/hooks';
import { Loader } from '@mantine/core';
import { IHistoryProps } from './history.props';
import css from './history.module.scss';

const isSystemHistories = CrmHistoryConst.Access.SystemHistories;

export const History: FC<IHistoryProps> = () => {
	const isLoading = useStateSelector((state) => state.crm_card.isLoading);
	const isDisplaySystemHistories = useAccess({ access: isSystemHistories });
	const { organizationID, contactID } = useStateSelector((state) => state.crm_history.config);
	const { feed, next, isEnd } = useFeed({ organizationID, contactID });

	const [sentryRef] = useInfiniteScroll({
		loading: false,
		hasNextPage: true,
		onLoadMore: () => next(),
		delayInMs: 300,
	});

	if (isLoading) {
		return (
			<div className={css.wrapper}>
				<Skeleton />
			</div>
		);
	}

	return (
		<div className={css.scroll}>
			<div className={css.wrapper}>
				{feed.map((historyItem) => {
					if (!isDisplaySystemHistories && historyItem.isSystem) {
						return null;
					}

					if (historyItem.type == EnCrmHistoryTypes.Comment) {
						return (
							<Item.Comment
								history={historyItem}
								key={`${historyItem.type}_${historyItem.id}`}
								className={css.historyItem}
							/>
						);
					}

					if (historyItem.type == EnCrmHistoryTypes.Log) {
						return (
							<Item.Log
								history={historyItem}
								key={`${historyItem.type}_${historyItem.id}`}
								className={css.historyItem}
							/>
						);
					}

					if (historyItem.type == EnCrmHistoryTypes.Call) {
						return (
							<Item.Call
								history={historyItem}
								key={`${historyItem.type}_${historyItem.id}`}
								className={css.historyItem}
							/>
						);
					}
				})}

				{!isEnd && (
					<div ref={sentryRef}>
						<Loader color={TailwindColors.neutral[100]} size="sm" className={css.loader} />
					</div>
				)}
			</div>
		</div>
	);
};
