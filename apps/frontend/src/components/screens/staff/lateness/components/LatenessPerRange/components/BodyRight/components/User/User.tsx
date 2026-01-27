import { FC } from 'react';
import { Button, ContentBlock, Icon, Menu, TextField } from '@fsd/shared/ui-kit';
import { DateSuffix } from '@helpers/DateSuffix';
import { UserProps } from '.';
import css from './user.module.scss';
import { MenuItemStaffCall } from '@fsd/shared/ui-kit/menu/items';
import { StaffAvatar } from '@fsd/entities/staff';

export const User: FC<UserProps> = ({ data }) => {
	const { user, calculate } = data;
	if (!calculate) return <></>;

	return (
		<ContentBlock className={css.wrapper}>
			<StaffAvatar user={user} />

			<div>
				<TextField className={css.userName}>
					{user.lastName} {user.firstName}
				</TextField>

				<TextField size={'small'} className={css.workPosition}>
					{user.workPosition}
				</TextField>
			</div>

			<div>
				<TextField size={'small'} className={css.lateCountTitle}>
					Пропущено:
				</TextField>

				<TextField className={css.lateCount}>
					{Math.floor(calculate.lateMinutes / 60)} из{' '}
					{DateSuffix(Math.floor(calculate.workingMinutes / 60), ['часа', 'часов', 'часов'], true)}
				</TextField>
			</div>

			<Menu
				control={
					<div>
						<Button color={'primary'} className={css.callButton}>
							<Icon name={'phone-f'} />
						</Button>
					</div>
				}
			>
				{!!user.phoneVoip && (
					<MenuItemStaffCall mode={'voip'} phone={Number(user.phoneVoip)} text={'Внутренний'} />
				)}

				{!!user.phoneMobile && (
					<MenuItemStaffCall mode={'mobile'} phone={Number(user.phoneMobile)} text={'Мобильный'} />
				)}
			</Menu>
		</ContentBlock>
	);
};
