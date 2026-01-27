import { FC, useEffect, useState } from 'react';
import cn from 'classnames';
import { format } from 'date-fns';
import { AvatarGroup, ContentBlock, TextField } from '@fsd/shared/ui-kit';
import { DateSuffix } from '@helpers/DateSuffix';
import { Grid } from '@mantine/core';
import { useElementSize, useViewportSize } from '@mantine/hooks';
import { VacationResponse } from '../../interfaces';
import { getData } from '../../utils/get-data';
import { VacationNowDashboardProps } from '.';
import css from './vacation-now-dashboard.module.scss';

const selfDate = new Date();
const formatSelfDate = format(selfDate, 'yyyy-MM-dd');

export const VacationNowDashboard: FC<VacationNowDashboardProps> = ({ className, ...props }) => {
	const [data, setData] = useState<VacationResponse[]>([]);
	const [fakeCount, setFakeCount] = useState<number>(0);
	const [notFakeCount, setMotFakeCount] = useState<number>(0);

	const { width: screenWidth } = useViewportSize();
	const { ref } = useElementSize();
	const [spanCount, setSpanCount] = useState<number>(20);

	useEffect(() => {
		let isMounted = true;

		(async () => {
			const findVacation = await getData({
				date: { dateStart: formatSelfDate, dateEnd: formatSelfDate },
				filterIsFake: true,
			});
			if (isMounted) {
				setData(findVacation);
				setFakeCount(findVacation.filter((vacation) => vacation.isFake).length);
				setMotFakeCount(findVacation.filter((vacation) => !vacation.isFake).length);
			}
		})();

		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		if (screenWidth >= 100 && screenWidth <= 1150) setSpanCount(50);
		if (screenWidth >= 1150 && screenWidth <= 1250) setSpanCount(45);
		if (screenWidth >= 1250 && screenWidth <= 1400) setSpanCount(40);
		if (screenWidth >= 1400 && screenWidth <= 1550) setSpanCount(35);
		if (screenWidth >= 1550 && screenWidth <= 1850) setSpanCount(30);
		if (screenWidth >= 1850 && screenWidth <= 2200) setSpanCount(25);
		if (screenWidth >= 2200 && screenWidth <= 2850) setSpanCount(20);
		if (screenWidth >= 2850 && screenWidth <= 3600) setSpanCount(15);
	}, [screenWidth]);

	return data.length ? (
		<Grid.Col span={spanCount} ref={ref} {...props}>
			<ContentBlock className={cn(css.root, className)}>
				<TextField mode="heading" size="small">
					В отпуске сегодня
				</TextField>

				<AvatarGroup
					data={data.map(({ user }) => ({
						color: user?.color,
						text: `${user?.lastName[0]}${user?.lastName[1]}`,
						src: user?.photo,
					}))}
					size={'small'}
					limit={3}
					className={css.avatars}
				/>

				<div className={css.text}>
					<TextField>
						На сегодня, в отпуске:{' '}
						{DateSuffix(data.length, ['сотрудник', 'сотрудника', 'сотрудников'], true)}
					</TextField>

					{!!fakeCount && (
						<TextField size={'small'}>
							Отпуск по документам <span>(фейк)</span>:{' '}
							{DateSuffix(fakeCount, ['сотрудник', 'сотрудника', 'сотрудников'], true)}
						</TextField>
					)}

					{!!notFakeCount && (
						<TextField size={'small'}>
							В настоящем отпуске:{' '}
							{DateSuffix(notFakeCount, ['сотрудник', 'сотрудника', 'сотрудников'], true)}
						</TextField>
					)}
				</div>
			</ContentBlock>
		</Grid.Col>
	) : null;
};
