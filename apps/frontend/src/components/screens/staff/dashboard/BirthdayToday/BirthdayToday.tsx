import { FC, useEffect, useState } from 'react';
import cn from 'classnames';
import { differenceInYears, parseISO } from 'date-fns';
import { StaffAvatar } from '@fsd/entities/staff';
import { ContentBlock, TextField } from '@fsd/shared/ui-kit';
import { CallButton } from '@fsd/shared/ui-kit/button/items';
import { useAccess, useUserDeprecated } from '@hooks';
import { IUserResponse } from '@interfaces/user/UserList.response';
import { Grid } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import GiftSvg from '@public/img/gift.svg';
import UserService from '@services/User.service';
import { BirthdayTodayProps } from './props';
import css from './styles.module.scss';

export const BirthdayToday: FC<BirthdayTodayProps> = ({ className }) => {
	const { width: screenWidth } = useViewportSize();
	const { userId } = useUserDeprecated();
	const CheckAccess = useAccess();
	const [data, setData] = useState<IUserResponse[]>();
	const [spanCount, setSpanCount] = useState<number>(25);

	useEffect(() => {
		if (screenWidth >= 300 && screenWidth <= 1200) setSpanCount(40);
		if (screenWidth >= 1200 && screenWidth <= 1300) setSpanCount(35);
		if (screenWidth >= 1300 && screenWidth <= 1550) setSpanCount(30);
		if (screenWidth >= 1550 && screenWidth <= 1850) setSpanCount(25);
		if (screenWidth >= 1850 && screenWidth <= 2350) setSpanCount(20);
		if (screenWidth >= 2350 && screenWidth <= 2850) setSpanCount(15);
		if (screenWidth >= 2850 && screenWidth <= 3600) setSpanCount(12);
	}, [screenWidth]);

	useEffect(() => {
		let isMounted = true;

		(async () => {
			const [response] = await UserService.findBirthdayToday();
			if (response && isMounted) setData(response);
		})();

		return () => {
			isMounted = false;
		};
	}, []);

	return data?.length ? (
		<>
			{data.map((user) => {
				if (userId === user.id) return null;

				return (
					<Grid.Col span={spanCount} key={user.id}>
						<ContentBlock className={cn(css.root, className)}>
							<GiftSvg className={css.icon} />

							<StaffAvatar user={user} className={css.avatar} />

							<TextField className={css.name} size="large">
								{user.lastName}
								<br />
								{user.firstName}
							</TextField>

							<TextField className={css.info} size="small">
								{user.territory.name}, {user.workPosition}
							</TextField>

							<TextField className={css.text} size="small">
								Сегодня празднует свой
								{CheckAccess([]) &&
									` ${Math.floor(differenceInYears(new Date(), parseISO(user.birthday)))}`}{' '}
								день рождения!
							</TextField>

							<CallButton
								className={css.call}
								phoneMobile={user.phoneMobile}
								phoneVoip={user.phoneVoip}
							/>
						</ContentBlock>
					</Grid.Col>
				);
			})}
		</>
	) : null;
};
