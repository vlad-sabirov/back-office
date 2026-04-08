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

const eventTypeLabels: Record<string, string> = {
	meeting: 'Встреча',
	call: 'Звонок',
	note: 'Заметка',
	reminder: 'Напоминание',
};

const formatLogPayload = (payload: string): string => {
	try {
		const data = JSON.parse(payload);
		if (data.action === 'event_created') {
			const type = eventTypeLabels[data.type] || data.type || 'Событие';
			return `${type} создана: "${data.title}"`;
		}
		if (data.action === 'task_created') {
			return `Задача создана: "${data.title}"`;
		}
		return payload;
	} catch {
		return payload;
	}
};

export const Log: FC<IProps> = ({ history, className }) => {
	const user = useMemo(() => history.user, [history.user]);
	const date = useMemo(() => {
		return format(parseISO(history.createdAt), 'dd MMMM yyyy (HH:mm)', { locale: dateFnsLocaleRu });
	}, [history.createdAt]);
	const displayPayload = useMemo(() => formatLogPayload(history.payload as string), [history.payload]);

	if (!user || history.type != EnCrmHistoryTypes.Log) {
		return null;
	}

	// Задачи и события уже показываются отдельными блоками — лог-дубли не нужны
	try {
		const data = JSON.parse(history.payload as string);
		if (data.action === 'task_created' || data.action === 'event_created') {
			return null;
		}
	} catch { /* ignore parse errors */ }

	return (
		<div className={className}>
			<StaffAvatar user={user} size={'small'} className={css.avatar} />
			<TextField className={css.date} size={'small'}>
				{date}
			</TextField>
			<TextField className={css.log} size={'small'}>
				{displayPayload}
			</TextField>
		</div>
	);
};
