import { FC, useEffect, useState } from 'react';
import cn from 'classnames';
import { differenceInHours, parseISO } from 'date-fns';
import { useRouter } from 'next/router';
import { Button, ContentBlock, Icon, TextField } from '@fsd/shared/ui-kit';
import TailwindColors from '@config/tailwind/color';
import { DateSuffix } from '@helpers/DateSuffix';
import { useRandom } from '@hooks';
import { Grid, Tooltip } from '@mantine/core';
import { useInterval, useViewportSize } from '@mantine/hooks';
import { showNotification, updateNotification } from '@mantine/notifications';
import { ILogisticVedOrderResponse } from '@screens/logistic';
import LogisticService from '@services/Logistic.service';
import { LogisticVedDashboardSkeleton } from '..';
import { LogisticVedDashboardCalculateProps } from './props';
import css from './styles.module.scss';

export const LogisticVedDashboardCalculate: FC<LogisticVedDashboardCalculateProps> = ({ className, ...props }) => {
	const { width: screenWidth } = useViewportSize();
	const router = useRouter();
	const random = useRandom();
	const interval = useInterval(() => handleRefresh(), random.calc(10000, 30000));
	const [spanCount, setSpanCount] = useState<number>(75);
	const [orders, setOrders] = useState<ILogisticVedOrderResponse[]>([]);
	const [orderRedCount, setOrderRedCount] = useState<number>(0);
	const [orderYellowCount, setOrderYellowCount] = useState<number>(0);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleClick = () => {
		router.push('/logistic/ved');
	};

	const handleNotification = () => {
		showNotification({
			id: 'logistic-ved-dashboard',
			message: 'Обновление',
			color: TailwindColors.primary.main,
			loading: true,
		});

		setTimeout(() => {
			updateNotification({
				id: 'logistic-ved-dashboard',
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
	}, []);

	useEffect(() => {
		setIsLoading(true);
		handleRefresh();
	}, []);

	useEffect(() => {
		if (screenWidth >= 115 && screenWidth <= 1150) setSpanCount(50);
		if (screenWidth >= 1150 && screenWidth <= 1300) setSpanCount(45);
		if (screenWidth >= 1300 && screenWidth <= 1400) setSpanCount(40);
		if (screenWidth >= 1400 && screenWidth <= 1650) setSpanCount(35);
		if (screenWidth >= 1650 && screenWidth <= 1950) setSpanCount(30);
		if (screenWidth >= 1950 && screenWidth <= 2270) setSpanCount(25);
		if (screenWidth >= 2270 && screenWidth <= 2900) setSpanCount(20);
		if (screenWidth >= 2900 && screenWidth <= 3600) setSpanCount(15);
	}, [screenWidth]);

	const handleRefresh = async () => {
		const [findOrders] = await LogisticService.findActiveWithRole('logisticVedOrdersCalculate');

		if (findOrders) {
			setOrderYellowCount(
				findOrders.filter((order) => {
					const updatedAt = parseISO(order.updatedAt);
					const diffHours = differenceInHours(new Date(), updatedAt);
					return diffHours > order.stage.warningTime && diffHours <= order.stage.errorTime;
				}).length
			);
			setOrderRedCount(
				findOrders.filter((order) => {
					const updatedAt = parseISO(order.updatedAt);
					const diffHours = differenceInHours(new Date(), updatedAt);
					return diffHours > order.stage.errorTime;
				}).length
			);
			setOrders(findOrders);
		}

		setIsLoading(false);
	};

	return (
		<Grid.Col span={spanCount} className={className} {...props}>
			<ContentBlock className={css.root}>
				{isLoading ? (
					<LogisticVedDashboardSkeleton />
				) : (
					<>
						<Tooltip
							label={'Обновить заявки'}
							withArrow
							openDelay={1000}
							position="top-end"
							transitionDuration={300}
						>
							<div className={css.link}>
								<Button
									size="small"
									onClick={() => {
										handleRefresh();
										handleNotification();
									}}
								>
									<Icon name="refresh" />
								</Button>
							</div>
						</Tooltip>

						<TextField mode="heading" size="small" className={css.title}>
							Заявки ВЭД
						</TextField>

						<Tooltip
							label={'Список всех заявок ВЭД, требующих твоего внимания'}
							withArrow
							openDelay={1000}
							transitionDuration={300}
							position={'top-start'}
						>
							<div>
								<TextField className={css.orderCount}>
									Требуют внимания: <span>{orders.length}</span>
								</TextField>
							</div>
						</Tooltip>

						<div className={css.info}>
							<Tooltip
								label={`Заявки попавшие в красную зону считаются критически просроченными.
                    Время потраченное на их исполнение сильно превышает запланированное.`}
								withArrow
								width={300}
								multiline
								openDelay={1000}
								transitionDuration={300}
								position={'top-start'}
							>
								<div
									className={cn(css.info__item, css.info__error, {
										[css.info__disabled]: orderRedCount === 0,
									})}
									onClick={handleClick}
								>
									<div className={css.info__icon}>
										<Icon name={'alarm'} />
									</div>
									<TextField className={css.info__title} size="large">
										{orderRedCount} {DateSuffix(orderRedCount, ['заявка', ' заявки', ' заявок'])}
									</TextField>
									<TextField className={css.info__description}>в красной зоне</TextField>
								</div>
							</Tooltip>

							<Tooltip
								label={
									`Заявки попавшие в желтую зону сигнализируют о том, что на их исполнение ` +
									`тратится много времени и следует ускориться`
								}
								withArrow
								width={300}
								multiline
								openDelay={1000}
								transitionDuration={300}
							>
								<div
									className={cn(css.info__item, css.info__warning, {
										[css.info__disabled]: orderYellowCount === 0,
									})}
									onClick={handleClick}
								>
									<div className={css.info__icon}>
										<Icon name={'alert'} />
									</div>
									<TextField className={css.info__title} size="large">
										{orderYellowCount}{' '}
										{DateSuffix(orderYellowCount, ['заявка', ' заявки', ' заявок'])}
									</TextField>
									<TextField className={css.info__description}>в желтой зоне</TextField>
								</div>
							</Tooltip>
						</div>
					</>
				)}
			</ContentBlock>
		</Grid.Col>
	);
};
