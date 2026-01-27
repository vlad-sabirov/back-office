import { FC } from "react";
import { v4 as uuid } from 'uuid';
import { TextField } from "@fsd/shared/ui-kit";
import { ICardEmailsProps } from "./card-emails.props";
import css from './card-emails.module.scss';

export const CardEmails: FC<ICardEmailsProps> = (
	{ emails }
) => {

	if (!emails || !emails.length) return null;

	if (emails.length === 1) {
		return (
			<TextField className={css.once}>
				Email: {' '}
				<span>{emails[0].value}</span>
				{emails[0].comment && ` ${emails[0].comment}`}
			</TextField>
		);
	}

	return (
		<div className={css.many}>
			<TextField className={css.manyTitle}>Emails:</TextField>
			{emails.map((email) => (
				<TextField key={'id' in email ? email.id : uuid()} className={css.manyItem}>
					<span>{email.value}</span>
					{email.comment && ` ${email.comment}`}
				</TextField>
			))}
		</div>
	);
}
