import { parsePhoneNumber } from '@helpers';
import { Tooltip } from '@mantine/core';
import { Icon, TextField } from '@fsd/shared/ui-kit';
import { FC } from 'react';
import { ContactCardT } from '.';
import css from './contact-card.module.scss';

export const ContactCard: FC<ContactCardT> = ({ contact, ...props }) => {
	return (
		<Tooltip label={'Выбрать'} withArrow offset={-10}>
			<div className={css.wrapper} {...props}>
				<div className={css.info}>
					<TextField className={css.name}>
						{contact.name}
					</TextField>

					<TextField size={'small'} className={css.workPosition}>
						{contact.workPosition}
					</TextField>

					{contact && contact.phones && contact.phones.length > 0 && (
						<div className={css.phones__wrapper}>
							{contact.phones?.map((phone) => {
								const parsedPhone = parsePhoneNumber(phone.value);
								return (
									<TextField
										key={phone.id}
										size={'small'}
										className={css.phones__item}
									> {parsedPhone.output} </TextField>
								);
							})}
						</div>
					)}
					
				</div>
				
				<div className={css.button}>
					<Icon name={'link'} className={css.icon} />
				</div>
			</div>
		</Tooltip>
	);
};
