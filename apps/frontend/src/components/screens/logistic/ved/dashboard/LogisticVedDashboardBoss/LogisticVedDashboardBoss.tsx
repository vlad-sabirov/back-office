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
import { stageDates } from '../../cfg';
import { LogisticVedDashboardSkeleton } from '..';
import { LogisticVedDashboardBossProps } from './props';
import css from './styles.module.scss';

export const LogisticVedDashboardBoss: FC<LogisticVedDashboardBossProps> = ({ className, ...props }) => {
	const { width: screenWidth } = useViewportSize();
	const router = useRouter();
	const random = useRandom();
	const interval = useInterval(() => handleRefresh(), random.calc(10000, 30000));
	const [spanCount, setSpanCount] = useState<number>(75);
	const [orders, setOrders] = useState<ILogisticVedOrderResponse[]>([]);
	const [orderRedCount, setOrderRedCount] = useState<number>(0);
	const [orderYellowCount, setOrderYellowCount] = useState<number>(0);
	const [orderModificationCount, setOrderModificationCount] = useState<number>(0);
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
		if (screenWidth >= 152 && screenWidth <= 1180) setSpanCount(75);
		if (screenWidth >= 1180 && screenWidth <= 1230) setSpanCount(70);
		if (screenWidth >= 1230 && screenWidth <= 1330) setSpanCount(65);
		if (screenWidth >= 1330 && screenWidth <= 1400) setSpanCount(60);
		if (screenWidth >= 1400 && screenWidth <= 1520) setSpanCount(55);
		if (screenWidth >= 1520 && screenWidth <= 1840) setSpanCount(50);
		if (screenWidth >= 1840 && screenWidth <= 2140) setSpanCount(40);
		if (screenWidth >= 2140 && screenWidth <= 2760) setSpanCount(33);
		if (screenWidth >= 2760 && screenWidth <= 3380) setSpanCount(25);
		if (screenWidth >= 3380 && screenWidth <= 3600) setSpanCount(20);
	}, [screenWidth]);

	const handleRefresh = async () => {
		const [findOrders] = await LogisticService.findActive();

		if (findOrders) {
			setOrderModificationCount(findOrders.filter((order) => order.isModification).length);
			setOrderYellowCount(
				findOrders.filter((order) => {
					const updatedAt = parseISO(order.updatedAt);
					const diffHours = differenceInHours(new Date(), updatedAt);
					return (
						(order.isModification &&
							diffHours > stageDates.inWorking.warningTime &&
							diffHours <= stageDates.inWorking.errorTime) ||
						(!order.isModification &&
							diffHours > order.stage.warningTime &&
							diffHours <= order.stage.errorTime)
					);
				}).length
			);
			setOrderRedCount(
				findOrders.filter((order) => {
					const updatedAt = parseISO(order.updatedAt);
					const diffHours = differenceInHours(new Date(), updatedAt);
					return (
						(order.isModification && diffHours > stageDates.inWorking.errorTime) ||
						(!order.isModification && diffHours > order.stage.errorTime)
					);
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
							Активные заявки ВЭД
						</TextField>

						<Tooltip
							label={'Список всех заявок ВЭД, над которыми ведется работа'}
							withArrow
							openDelay={1000}
							transitionDuration={300}
							position={'top-start'}
						>
							<div>
								<TextField className={css.orderCount}>
									Активных заявок: <span>{orders.length}</span>
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
								position={'top-start'}
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

							<Tooltip
								label={`Неправильно оформленные заявки, отправленные менеджеру на доработку`}
								withArrow
								width={300}
								multiline
								openDelay={1000}
								transitionDuration={300}
							>
								<div
									className={cn(css.info__item, css.info__info, {
										[css.info__disabled]: orderModificationCount === 0,
									})}
									onClick={handleClick}
								>
									<div className={css.info__icon}>
										<Icon name={'information'} />
									</div>
									<TextField className={css.info__title} size="large">
										{orderModificationCount}{' '}
										{DateSuffix(orderModificationCount, ['заявка', ' заявки', ' заявок'])}
									</TextField>
									<TextField className={css.info__description}>на доработке</TextField>
								</div>
							</Tooltip>
						</div>
					</>
				)}
			</ContentBlock>
		</Grid.Col>
	);
};
