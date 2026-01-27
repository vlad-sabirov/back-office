import { FC } from 'react';
import { v4 as uuid } from 'uuid';
import { CallTo } from '@fsd/entities/voip';
import { TextField } from '@fsd/shared/ui-kit';
import { parsePhoneNumber } from '@helpers';
import { ICardPhonesProps } from './card-phones.props';
import css from './card-phones.module.scss';

export const CardPhones: FC<ICardPhonesProps> = ({ phones, name }) => {
	if (!phones || !phones.length) return null;

	if (phones.length === 1) {
		return (
			<TextField className={css.once}>
				Телефон:{' '}
				<CallTo callToPhone={phones[0].value} callToName={name} offset={-2}>
					<span>{parsePhoneNumber(phones[0].value).output}</span>
				</CallTo>
				{phones[0].comment && ` ${phones[0].comment}`}
			</TextField>
		);
	}

	return (
		<div className={css.many}>
			<TextField className={css.manyTitle}>Телефоны:</TextField>
			{phones.map((phone) => (
				<TextField key={'id' in phone ? phone.id : uuid()} className={css.manyItem}>
					<CallTo callToPhone={phone.value} callToName={name} offset={-2}>
						<span>{parsePhoneNumber(phone.value).output}</span>
					</CallTo>
					{phone.comment && ` ${phone.comment}`}
				</TextField>
			))}
		</div>
	);
};
