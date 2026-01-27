import { FC, useContext, useEffect } from 'react';
import { Button, Icon } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { useRandom } from '@hooks';
import { Tooltip } from '@mantine/core';
import { useInterval } from '@mantine/hooks';
import { showNotification, updateNotification } from '@mantine/notifications';
import TailwindColors from '../../../../../../../config/tailwind/color';

export const Refresh: FC = () => {
	const { logisticStore } = useContext(MainContext);
	const random = useRandom();
	const interval = useInterval(() => handleRefresh(), random.calc(10000, 15000));

	const handleRefresh = () => {
		logisticStore.getLogisticVedStageListWithOrderOptions({
			userId: logisticStore.displayOrdersAuthor,
			isClose: logisticStore.displayOrdersClosed,
			isDone: logisticStore.displayOrdersDone,
		});
	};

	const handleNotification = () => {
		showNotification({
			id: 'logistic-ved-orders-refresh',
			message: 'Обновление',
			color: TailwindColors.primary.main,
			loading: true,
		});

		setTimeout(() => {
			updateNotification({
				id: 'logistic-ved-orders-refresh',
				message: 'Обновление завершено',
				autoClose: 3000,
				color: 'green',
				loading: false,
			});
		}, 1000);
	};

	useEffect(() => {
		interval.start();
		return interval.stop;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [interval]);

	return (
		<Tooltip label={'Обновить заявки'} withArrow openDelay={1000} transitionDuration={300}>
			<div>
				<Button
					color="neutral"
					variant="easy"
					onClick={() => {
						handleRefresh();
						handleNotification();
					}}
				>
					<Icon name="refresh" />
				</Button>
			</div>
		</Tooltip>
	);
};
