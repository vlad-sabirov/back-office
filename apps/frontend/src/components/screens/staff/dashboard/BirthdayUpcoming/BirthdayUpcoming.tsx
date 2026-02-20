import { FC, useEffect, useState } from 'react';
import { BirthdayUpcomingSkeleton } from './BirthdayUpcoming.skeleton';
import cn from 'classnames';
import { format, formatRelative, parse, parseISO } from 'date-fns';
import { ContentBlock, Menu, TextField } from '@fsd/shared/ui-kit';
import { customLocaleRu } from '@config/date-fns.locale';
import { IUserResponse } from '@interfaces/user/UserList.response';
import { Grid } from '@mantine/core';
import { useElementSize, useViewportSize } from '@mantine/hooks';
import UserService from '@services/User.service';
import { BirthdayUpcomingProps } from './props';
import css from './styles.module.scss';
import { MenuItemStaffUser } from '@fsd/shared/ui-kit/menu/items';
import { StaffAvatar } from '@fsd/entities/staff';

const minWidth = 1000;
const currentDate = new Date();
const currentYear = currentDate.getFullYear();

export const BirthdayUpcoming: FC<BirthdayUpcomingProps> = ({ className }) => {
	const { width: screenWidth } = useViewportSize();
	const { ref, width: blockWidth } = useElementSize();
	const [data, setData] = useState<IUserResponse[]>();
	const [spanCount, setSpanCount] = useState<number>(50);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		if (screenWidth >= 275 && screenWidth <= 1150) setSpanCount(75);
		if (screenWidth >= 1150 && screenWidth <= 1250) setSpanCount(70);
		if (screenWidth >= 1250 && screenWidth <= 1300) setSpanCount(65);
		if (screenWidth >= 1300 && screenWidth <= 1400) setSpanCount(60);
		if (screenWidth >= 1400 && screenWidth <= 1500) setSpanCount(55);
		if (screenWidth >= 1500 && screenWidth <= 1650) setSpanCount(50);
		if (screenWidth >= 1650 && screenWidth <= 1850) setSpanCount(45);
		if (screenWidth >= 1850 && screenWidth <= 2050) setSpanCount(40);
		if (screenWidth >= 2050 && screenWidth <= 2350) setSpanCount(35);
		if (screenWidth >= 2350 && screenWidth <= 2750) setSpanCount(30);
		if (screenWidth >= 2750 && screenWidth <= 3600) setSpanCount(25);
	}, [screenWidth]);

	useEffect(() => {
		let isMounted = true;
		setIsLoading(true);

		(async () => {
			try {
				const [response] = await UserService.findBirthdayUpcoming(6);
				if (response && isMounted) setData(response);
			} catch {
				// API error — keep empty state
			} finally {
				if (isMounted) setIsLoading(false);
			}
		})();

		return () => {
			isMounted = false;
		};
	}, []);

	return (
		<Grid.Col span={spanCount} ref={ref}>
			<ContentBlock className={cn(css.root, className)}>
				{isLoading ? (
					<BirthdayUpcomingSkeleton />
				) : (
					<>
						<TextField mode="heading" size="small">
							Дни рождения
						</TextField>

						{!!data?.length && (
							<div
								className={cn(css.staff, {
									[css.staff__long]: blockWidth > minWidth,
								})}
							>
								{data.map((user, index) => {
									if (index + 1 > 4 && blockWidth < minWidth) return;
									const birthdayDate = parse(
										`${currentYear}-${format(parseISO(user.birthday), 'MM-dd')}`,
										'yyyy-MM-dd',
										currentDate
									);
									const birthdayDiffFormatted = formatRelative(birthdayDate, currentDate, {
										locale: customLocaleRu,
									});

									return (
										<Menu
											key={user.id}
											width={250}
											offset={-12}
											position="bottom-start"
											control={
												<div className={css.staff__item}>
													<StaffAvatar
														user={user}
														size="small"
														className={css.staff__avatar}
													/>

													<TextField className={css.staff__name}>
														{user.lastName} {user.firstName}
													</TextField>

													<TextField className={css.staff__birthday} size="small">
														{birthdayDiffFormatted}
													</TextField>
												</div>
											}
										>
											<MenuItemStaffUser data={user} />
										</Menu>
									);
								})}
							</div>
						)}
					</>
				)}
			</ContentBlock>
		</Grid.Col>
	);
};
