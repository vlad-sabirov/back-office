import { FC, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { EnCrmHistoryTypes, ICrmHistoryEntity } from '@fsd/entities/crm-history';
import { StaffAvatar } from '@fsd/entities/staff';
import { dateFnsLocaleRu } from '@fsd/shared/lib/date-fns.ru.locale';
import { TextField } from '@fsd/shared/ui-kit';
import css from './log.module.scss';

interface IProps {
	history: ICrmHistoryEntity;
	className?: string;
}

export const Log: FC<IProps> = ({ history, className }) => {
	const user = useMemo(() => history.user, [history.user]);
	const date = useMemo(() => {
		return format(parseISO(history.createdAt), 'dd MMMM yyyy (HH:mm)', { locale: dateFnsLocaleRu });
	}, [history.createdAt]);

	if (!user || history.type != EnCrmHistoryTypes.Log) {
		return null;
	}
	return (
		<div className={className}>
			<StaffAvatar user={user} size={'small'} className={css.avatar} />
			<TextField className={css.date} size={'small'}>
				{date}
			</TextField>
			<TextField className={css.log} size={'small'}>
				{history.payload}
			</TextField>
		</div>
	);
};
