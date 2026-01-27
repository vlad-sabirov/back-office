import { useContext } from 'react';
import { LogisticOrderVedCardButtons } from './parts/Buttons';
import { LogisticOrderVedCardFileHistory } from './parts/FileHistory';
import { LogisticOrderVedCardInfo } from './parts/Info';
import { LogisticOrderVedCardTabs } from './parts/Tabs';
import { LogisticOrderVedCardUploadFile } from './parts/UploadFile';
import { format, parseISO } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { Modal } from '@fsd/shared/ui-kit';
import { customLocaleRu } from '@config/date-fns.locale';
import { MainContext } from '@globalStore';

const accessRolesFileCalculate = ['developer', 'logisticVedOrdersVed', 'logisticVedOrdersCalculate', 'boss'];

export const OrderCardModal = observer((): JSX.Element => {
	const { modalStore, logisticStore } = useContext(MainContext);

	return (
		<Modal
			title={`Заявка от ${
				logisticStore.logisticVedOrderCurrent?.createdAt
					? format(parseISO(logisticStore.logisticVedOrderCurrent.createdAt), 'd LLLL, yyyyг.', {
							locale: customLocaleRu,
					})
					: null
			}`}
			opened={modalStore.modals.logisticVedOrderCard}
			onClose={() => modalStore.modalOpen('logisticVedOrderCard', false)}
			size={720}
			loading={logisticStore.isLoadingCurrent}
		>
			{logisticStore.logisticVedOrderCurrent ? (
				<>
					<LogisticOrderVedCardInfo
						order={logisticStore.logisticVedOrderCurrent}
						access={accessRolesFileCalculate}
					/>
					{logisticStore.logisticVedOrderCurrent?.stage ? (
						<LogisticOrderVedCardButtons
							stageId={logisticStore.logisticVedOrderCurrent?.stage.id}
							stageAlias={logisticStore.logisticVedOrderCurrent?.stage.alias}
						/>
					) : null}
					<LogisticOrderVedCardTabs order={logisticStore.logisticVedOrderCurrent} />
					<LogisticOrderVedCardUploadFile />
					<LogisticOrderVedCardFileHistory />
				</>
			) : null}
		</Modal>
	);
});
