import { FC } from 'react';
import { ISystemProps } from './system.types';
import { format, parseISO } from 'date-fns';
import { customLocaleRu } from '@config/date-fns.locale';
import { useAccess } from '@fsd/shared/lib/hooks';
import { TextField } from '@fsd/shared/ui-kit';
import { ACCESS } from '../../config/access';
import css from '../_staff-profile/staff-profile.module.scss';

export const System: FC<ISystemProps> = (props) => {
	const { user } = props;
	const isAccess = useAccess({ access: ACCESS.SYSTEM });

	if (!user) {
		return null;
	}

	if (!isAccess) {
		return null;
	}
	return (
		<>
			<TextField className={css.contactsTitle} mode={'heading'} size={'small'}>
				Системная информация
			</TextField>

			<div className={css.contacts}>
				{!!user.username && (
					<TextField className={css.simpleBlock} size={'small'}>
						Логин <span>{user.username}</span>
					</TextField>
				)}

				{!!user.lastLogin && (
					<TextField className={css.simpleBlock} size={'small'}>
						Последний вход{' '}
						<span>
							{format(parseISO(user.lastLogin as unknown as string), 'dd MMMM yyyyг. HH:mm', {
								locale: customLocaleRu,
							})}
						</span>
					</TextField>
				)}

				{!!user.telegramId && (
					<TextField className={css.simpleBlock} size={'small'}>
						Telegram ID <span>{user.telegramId}</span>
					</TextField>
				)}

				<TextField className={css.simpleBlock} size={'small'}>
					Опоздания <span>{user.isFixLate ? 'Фиксируются' : 'Не фиксируются'}</span>
				</TextField>
			</div>
		</>
	);
};
