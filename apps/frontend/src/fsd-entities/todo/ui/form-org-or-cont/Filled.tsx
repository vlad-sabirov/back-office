import { FC, useCallback } from 'react';
import { IFormOrgOrContProps } from './form-org-or-cont.types';
import css from '@fsd/entities/todo/ui/form-org-or-cont/form-org-or-cont.module.scss';
import { parsePhoneNumber } from '@fsd/shared/lib/parsePhoneNumber';
import { Icon, TextField } from '@fsd/shared/ui-kit';

export const Filled: FC<IFormOrgOrContProps> = (props) => {
	const { value, onChange } = props;

	const handleClean = useCallback(() => {
		onChange(null);
	}, [onChange]);

	if (!value) return null;
	return (
		<div className={css.filled} onClick={handleClean}>
			<div className={css.filled__itemLeft}>
				<TextField className={css.filled__name} size={'small'}>
					{value.name}
				</TextField>

				{value.description.map((desc) => {
					return (
						<TextField key={desc} className={css.filled__description} size={'small'}>
							{desc}
						</TextField>
					);
				})}

				<div className={css.filled__phones}>
					{value.phones.map((phone) => {
						return (
							<TextField key={phone} className={css.filled__phone} size={'small'}>
								<Icon name={'phone-f'} />
								{parsePhoneNumber(phone).output}
							</TextField>
						);
					})}
				</div>
			</div>
			<div className={css.filled__close}>
				<Icon name={'close-medium'} />
			</div>
		</div>
	);
};
