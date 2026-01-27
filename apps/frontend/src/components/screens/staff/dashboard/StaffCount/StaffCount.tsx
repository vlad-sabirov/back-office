import { FC, useEffect, useState } from 'react';
import { StaffCountSkeleton } from './StaffCount.skeleton';
import { ContentBlock, Icon, TextField } from '@fsd/shared/ui-kit';
import { Grid } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { UserCountAllEntity } from '@screens/staff/interfaces/user-count-all.entity';
import UserService from '@services/User.service';
import { StaffCountProps } from './props';
import css from './styles.module.scss';

export const StaffCount: FC<StaffCountProps> = (props) => {
	const { className } = props;
	const { width: screenWidth } = useViewportSize();
	const [data, setData] = useState<UserCountAllEntity>();
	const [spanCount, setSpanCount] = useState<number>(75);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		if (screenWidth >= 150 && screenWidth <= 1150) setSpanCount(55);
		if (screenWidth >= 1150 && screenWidth <= 1300) setSpanCount(50);
		if (screenWidth >= 1300 && screenWidth <= 1400) setSpanCount(45);
		if (screenWidth >= 1400 && screenWidth <= 1600) setSpanCount(40);
		if (screenWidth >= 1600 && screenWidth <= 1800) setSpanCount(35);
		if (screenWidth >= 1800 && screenWidth <= 2100) setSpanCount(30);
		if (screenWidth >= 2100 && screenWidth <= 2600) setSpanCount(25);
		if (screenWidth >= 2600 && screenWidth <= 3600) setSpanCount(20);
	}, [screenWidth]);

	useEffect(() => {
		let isMounted = true;
		setIsLoading(true);

		(async () => {
			const [response] = await UserService.countAll();
			if (response && isMounted) setData(response);
			setIsLoading(false);
		})();

		return () => {
			isMounted = false;
		};
	}, []);

	return (
		<Grid.Col span={spanCount} className={className} {...props}>
			<ContentBlock className={css.root}>
				{isLoading ? (
					<StaffCountSkeleton />
				) : (
					<>
						<TextField mode="heading" size="small">
							Сотрудники
						</TextField>

						<div className={css.info}>
							<div className={css.sex}>
								<div className={css.sex__item}>
									<Icon name="users" className={css.sex__icon} data-sex={'all'} />
									<TextField className={css.sex__text}>
										Всего сотрудников: <span>{data?.all || 0}</span>
									</TextField>
								</div>

								<div className={css.sex__item}>
									<Icon name="male" className={css.sex__icon} data-sex={'male'} />
									<TextField className={css.sex__text}>
										Мужчин: <span>{data?.sex.male || 0}</span>
									</TextField>
								</div>

								<div className={css.sex__item}>
									<Icon name="female" className={css.sex__icon} data-sex={'female'} />
									<TextField className={css.sex__text}>
										Женщин: <span>{data?.sex.female || 0}</span>
									</TextField>
								</div>
							</div>

							<div className={css.territory}>
								{!!data?.territory.length &&
									data?.territory.map((territory) => (
										<TextField key={territory.name}>
											{territory.name}: <span>{territory.count}</span>
										</TextField>
									))}
							</div>
						</div>
					</>
				)}
			</ContentBlock>
		</Grid.Col>
	);
};
