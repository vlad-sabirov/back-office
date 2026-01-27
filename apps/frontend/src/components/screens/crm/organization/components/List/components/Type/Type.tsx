import { TextField } from '@fsd/shared/ui-kit';
import cn from 'classnames';
import { capitalize } from 'lodash';
import { FC } from 'react';
import { TypeT } from '.';
import css from './type.module.scss';

export const Type: FC<TypeT> = (
	{ organization, className }
) => {
	return (
		<TextField className={cn(css.text, className)}>
			{
				organization.type 
					? capitalize(organization.type?.name)
					: 'Другое'
			}
		</TextField>
	);
};
