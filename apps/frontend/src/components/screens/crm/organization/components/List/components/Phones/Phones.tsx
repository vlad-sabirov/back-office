import { parsePhoneNumber } from '@helpers';
import cn from 'classnames';
import { TextField } from '@fsd/shared/ui-kit';
import { FC } from 'react';
import { PhonesT } from '.';
import css from './phones.module.scss';

export const Phones: FC<PhonesT> = (
	{ organization, className }
) => {
	return (
		<TextField className={cn(css.text, className)}>
			{
				!!organization.phones?.length
					&& parsePhoneNumber(organization.phones[0].value).output
			}
			
			{
				organization.phones
					&& organization.phones?.length > 1
					&& <span>еще {organization.phones.length - 1}...</span>
			}
		</TextField>
	);
};
