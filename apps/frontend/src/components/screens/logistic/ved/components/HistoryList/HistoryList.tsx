import { FC } from 'react';
import { format, formatDistance, parseISO } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { Avatar, TextField } from '@fsd/shared/ui-kit';
import { customLocaleRu } from '@config/date-fns.locale';
import { useAccess } from '@hooks';
import { Timeline } from '@mantine/core';
import { HistoryListProps } from './props';
import css from './styles.module.scss';

const accessRoles = { secret: ['developer'] };

export const HistoryList: FC<HistoryListProps> = observer(({ data }) => {
	const CheckAccess = useAccess();

	if (data?.length)
		return (
			<div className={css.root}>
				<Timeline active={0}>
					{data.map((history) => {
						if (history.author)
							return (
								<Timeline.Item key={`historyId${history.id}`}>
									<div className={css.wrapper}>
										<Avatar
											color={history.author.color}
											text={history.author.lastName[0] + history.author.firstName[0]}
											src={history.author.photo}
											className={css.photo}
										/>

										<TextField className={css.title}>{history.title}</TextField>

										<TextField className={css.description}>{history.description}</TextField>

										{CheckAccess(accessRoles.secret) && (
											<TextField className={css.secret} size="small">
												{history.secret}
											</TextField>
										)}

										<TextField size="small" className={css.date}>
											{format(parseISO(history.createdAt), 'd LLL yyyy, HH:mm', {
												locale: customLocaleRu,
											})}
											,{' '}
											{formatDistance(parseISO(history.createdAt), new Date(), {
												locale: customLocaleRu,
												addSuffix: true,
											})}
										</TextField>
									</div>
								</Timeline.Item>
							);
					})}
				</Timeline>
			</div>
		);

	return (
		<TextField mode="paragraph" size="large" className="tabEmpty">
			История пуста
		</TextField>
	);
});
