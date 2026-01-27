import { FC, useEffect, useState } from 'react';
import { ContentBlock, TextField } from '@fsd/shared/ui-kit';
import { Grid } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import css from './staff-task.module.scss';

export const StaffTask: FC = () => {
	const [spanCount, setSpanCount] = useState<number>(25);
	const { width: screenWidth } = useViewportSize();

	useEffect(() => {
		if (screenWidth >= 100 && screenWidth <= 1250) setSpanCount(100);
		if (screenWidth >= 1250 && screenWidth <= 1350) setSpanCount(65);
		if (screenWidth >= 1350 && screenWidth <= 1400) setSpanCount(60);
		if (screenWidth >= 1400 && screenWidth <= 1450) setSpanCount(55);
		if (screenWidth >= 1450 && screenWidth <= 1550) setSpanCount(50);
		if (screenWidth >= 1550 && screenWidth <= 1650) setSpanCount(45);
		if (screenWidth >= 1650 && screenWidth <= 1800) setSpanCount(40);
		if (screenWidth >= 1800 && screenWidth <= 1950) setSpanCount(35);
		if (screenWidth >= 1950 && screenWidth <= 2200) setSpanCount(30);
		if (screenWidth >= 2200 && screenWidth <= 2400) setSpanCount(25);
		if (screenWidth >= 2400 && screenWidth <= 2550) setSpanCount(25);
		if (screenWidth >= 2550 && screenWidth <= 2900) setSpanCount(20);
		if (screenWidth >= 2900 && screenWidth <= 3300) setSpanCount(17);
		if (screenWidth >= 3300 && screenWidth <= 3600) setSpanCount(15);
	}, [screenWidth]);

	return (
		<Grid.Col span={spanCount}>
			<ContentBlock className={css.root}>
				<TextField mode={'heading'} size={'small'}>
					Задачи
				</TextField>

				<TextField className={css.comingSoon} size={'large'}>
					В разработке...
				</TextField>
			</ContentBlock>
		</Grid.Col>
	);
};
