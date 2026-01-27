import { FC } from 'react';
import { ITeamProps } from './team.types';
import { TextField } from '@fsd/shared/ui-kit';
import { StaffUserWithAvatar } from '@screens/staff';
import css from '../_staff-profile/staff-profile.module.scss';

export const Team: FC<ITeamProps> = (props) => {
	const { user } = props;

	if (!user) {
		return null;
	}

	return (
		<>
			{!!user.children?.length && (
				<>
					<TextField className={css.staffTitle} mode={'heading'} size={'small'}>
						Руководитель у сотрудников
					</TextField>

					<div className={css.staffChildren}>
						{user.children.map((user) => (
							<StaffUserWithAvatar user={user} key={user.id} />
						))}
					</div>
				</>
			)}

			{!!user.parent && (
				<>
					<TextField className={css.staffTitle} mode={'heading'} size={'small'}>
						Руководитель
					</TextField>

					<StaffUserWithAvatar user={user.parent} />
				</>
			)}
		</>
	);
};
