import { observer } from 'mobx-react-lite';
import { Icon, Tabs } from '@fsd/shared/ui-kit';
import { ILogisticVedOrderResponse } from '@screens/logistic';
import { CommentAdd, CommentList, HistoryList } from '@screens/logistic/ved';
import css from './Tabs.module.scss';

interface LogisticOrderVedCardTabsProps {
	order: ILogisticVedOrderResponse;
}

export const LogisticOrderVedCardTabs = observer(({ order }: LogisticOrderVedCardTabsProps): JSX.Element => {
	return (
		<Tabs defaultValue="comment" className={css.wrapper}>
			<Tabs.List>
				<Tabs.Tab value="comment" icon={<Icon name="comment" />}>
					Комментарии
				</Tabs.Tab>

				<Tabs.Tab value="history" icon={<Icon name="history" />}>
					История
				</Tabs.Tab>
			</Tabs.List>

			<Tabs.Panel value="comment">
				{!order.isClose && !order.isDone ? <CommentAdd orderId={order.id} className={css.comment_add} /> : null}
				<CommentList data={order.comments} />
			</Tabs.Panel>

			<Tabs.Panel value="history">
				<HistoryList data={order.history} />
			</Tabs.Panel>
		</Tabs>
	);
});
