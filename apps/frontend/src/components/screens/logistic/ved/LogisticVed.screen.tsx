import { FC, useContext, useEffect, useState } from 'react';
import { Access } from './cfg';
import { OrderFilter, Refresh, RightSection, Skeleton, StageListActive, StageListComplete } from './components';
import { ILogisticVedStageResponse } from './interfaces';
import { OrderAddModal, OrderCardModal, StageAddModal } from './modals';
import { StageDeleteModal, StageEditModal, StageListModal } from './modals';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { HeaderContent } from '@components/HeaderContent/HeaderContent';
import TailwindColors from '@config/tailwind/color';
import { MainContext } from '@globalStore';
import { useAccess, useUserDeprecated } from '@hooks';
import { Loader } from '@mantine/core';

export const LogisticVedScreen: FC = observer(() => {
	const { logisticStore, modalStore } = useContext(MainContext);
	const CheckAccess = useAccess();
	const { userId } = useUserDeprecated();
	const { query } = useRouter();
	const [stage, setStage] = useState<ILogisticVedStageResponse[]>([]);
	const title = logisticStore.displayOrdersDone
		? 'Завершенные заявки ВЭД'
		: logisticStore.displayOrdersClosed
		? 'Закрытые заявки ВЭД'
		: 'Заявки ВЭД';

	useEffect(() => {
		setStage(logisticStore.logisticVedStageList as ILogisticVedStageResponse[]);
	}, [logisticStore.logisticVedStageList]);

	useEffect(() => {
		if (query.id) {
			(async () => {
				const [findOrder] = await logisticStore.getLogisticVedOrderByID(Number(query.id));
				if (findOrder && (CheckAccess(Access.viewCard) || userId === findOrder.authorId))
					modalStore.modalOpen('logisticVedOrderCard', true);
			})();
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [logisticStore, modalStore, query.id]);

	return (
		<>
			<Head>
				<title>Заявки ВЭД. Back Office</title>
			</Head>

			<HeaderContent
				title={title}
				leftSection={
					<div style={{ display: 'grid', gridAutoFlow: 'column', gap: '12px', alignItems: 'center' }}>
						<Refresh />
						<OrderFilter />
						{logisticStore.isLoadingList && <Loader color={TailwindColors.neutral[100]} size="sm" />}
					</div>
				}
				rightSection={<RightSection />}
			/>

			{!logisticStore.displayOrdersClosed && !logisticStore.displayOrdersDone ? (
				<>{stage?.length > 0 ? <StageListActive data={stage} /> : <Skeleton view={'kanban'} />}</>
			) : (
				<>{stage?.length > 0 ? <StageListComplete data={stage} /> : <Skeleton view={'list'} />}</>
			)}

			<OrderAddModal />
			<StageListModal />
			<OrderCardModal />

			{CheckAccess(Access.accessRolesSettings) && (
				<>
					<StageAddModal />
					<StageEditModal />
					<StageDeleteModal />
				</>
			)}
		</>
	);
});
