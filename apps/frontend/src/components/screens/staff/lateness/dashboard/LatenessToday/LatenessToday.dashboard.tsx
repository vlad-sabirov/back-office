import { FC, useEffect, useState } from 'react';
import { getTime } from 'date-fns';
import { ContentBlock } from '@fsd/shared/ui-kit';
import { useRandom } from '@hooks';
import { LatenessDataResponse } from '@interfaces';
import { Grid } from '@mantine/core';
import { useInterval, useViewportSize } from '@mantine/hooks';
import { LatenessPerDay } from '@screens/staff/lateness/components';
import { GetAllToday } from '@screens/staff/lateness/data';
import { LatenessTodayDashboardProps } from '.';
import css from './lateness-today-modal.module.scss';

const SELF_DATE = new Date();

export const LatenessTodayDashboard: FC<LatenessTodayDashboardProps> = ({ className, ...props }) => {
	const { width: screenWidth } = useViewportSize();
	const [data, setData] = useState<LatenessDataResponse[]>([]);
	const [refreshTime, setRefreshTime] = useState<number>(0);
	const [spanCount, setSpanCount] = useState<number>(75);
	const random = useRandom();
	const interval = useInterval(() => getData(), random.calc(15000, 20000));

	const getData = () => GetAllToday.get(SELF_DATE).then((res) => setData(res));

	useEffect(() => {
		getData();
	}, [refreshTime]);

	useEffect(() => {
		if (screenWidth >= 1450 && screenWidth <= 1550) setSpanCount(100);
		if (screenWidth >= 1550 && screenWidth <= 1650) setSpanCount(85);
		if (screenWidth >= 1650 && screenWidth <= 1750) setSpanCount(80);
		if (screenWidth >= 1750 && screenWidth <= 1850) setSpanCount(75);
		if (screenWidth >= 1850 && screenWidth <= 1950) setSpanCount(70);
		if (screenWidth >= 1950 && screenWidth <= 2100) setSpanCount(65);
		if (screenWidth >= 2100 && screenWidth <= 2300) setSpanCount(60);
		if (screenWidth >= 2300 && screenWidth <= 2500) setSpanCount(55);
		if (screenWidth >= 2500 && screenWidth <= 3600) setSpanCount(50);
	}, [screenWidth]);

	useEffect(() => {
		interval.start();
		return interval.stop;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [random, interval]);

	if (!data.length) return <></>;
	return (
		<Grid.Col span={spanCount} className={className} {...props}>
			<ContentBlock className={css.wrapper}>
				<div className={className} {...props}>
					<LatenessPerDay
						data={data}
						date={SELF_DATE}
						onSuccess={() => setRefreshTime(getTime(new Date()))}
					/>
				</div>
			</ContentBlock>
		</Grid.Col>
	);
};
