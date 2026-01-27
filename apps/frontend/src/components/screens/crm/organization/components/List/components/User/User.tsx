import { TextField } from '@fsd/shared/ui-kit';
import cn from 'classnames';
import { FC } from 'react';
import { UserT } from '.';
import css from './user.module.scss';

export const User: FC<UserT> = (
	{ organization, className }
) => {
	return (
		<TextField className={cn(css.text, className)}>
			{
				organization.user
					? `${organization.user.lastName} ${organization.user.firstName}`
					: `Общий котел`
			}
		</TextField>
	);
};
