import { FC, useState } from 'react';
import cn from 'classnames';
import Head from 'next/head';
import { Menu, Modal, TextField } from '@fsd/shared/ui-kit';
import { ArrivedPerDayModalProps } from '@screens/staff/lateness';
import css from './arrived-per-day.module.scss';
import { MenuItemStaffUser } from '@fsd/shared/ui-kit/menu/items';
import { StaffAvatar } from '@fsd/entities/staff';

export const ArrivedPerDayModal: FC<ArrivedPerDayModalProps> = ({ data, isOpen, setOpen, className, ...props }) => {
	const [isLoading] = useState<boolean>(false);

	const handleClose = (): void => setOpen(false);

	return (
		<Modal title="Пришедшие вовремя" opened={isOpen} onClose={handleClose} size={640} loading={isLoading}>
			<Head>
				<title>Пришедшие вовремя</title>
			</Head>
			<div className={cn(css.wrapper, className)} {...props}>
				{data.map(({ user, data }) => {
					return (
						<Menu
							offset={-32}
							key={user.id}
							control={
								<div className={css.item}>
									<StaffAvatar user={user} size={'small'} />

									<div>
										<TextField className={css.item__name}>
											{user.lastName} {user.firstName}
										</TextField>

										<TextField size={'small'} className={css.item__description}>
											Время захода {data?.[0]?.time}
										</TextField>
									</div>
								</div>
							}
						>
							<MenuItemStaffUser data={user} />
						</Menu>
					);
				})}
			</div>
		</Modal>
	);
};
