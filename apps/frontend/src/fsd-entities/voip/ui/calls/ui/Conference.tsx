// noinspection DuplicatedCode
import { FC, useEffect, useState } from 'react';
import { differenceInSeconds, parseISO } from 'date-fns';
import { ICallerProps } from '@fsd/entities/voip/ui/calls/caller.types';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { AvatarGroup, TextField } from '@fsd/shared/ui-kit';
import css from '../callers.module.scss';

export const Conference: FC<ICallerProps> = (props) => {
	const { call } = props;
	const staff = useStateSelector((state) => state.staff.data.voip);
	const [timer, setTimer] = useState<string>('');

	useEffect(() => {
		setTimeout(() => {
			const diff = differenceInSeconds(new Date(), parseISO(call.timestamp));
			const minutes = Math.floor(diff / 60);
			const seconds = diff % 60;

			const formattedDifference = `${minutes}:${seconds.toString().padStart(2, '0')}`;
			setTimer(String(formattedDifference));
		}, 1000);
	}, [call.timestamp, timer]);

	useEffect(() => {
		const diff = differenceInSeconds(new Date(), parseISO(call.timestamp));
		const minutes = Math.floor(diff / 60);
		const seconds = diff % 60;

		const formattedDifference = `${minutes}:${seconds.toString().padStart(2, '0')}`;
		setTimer(String(formattedDifference));
	}, [call.timestamp]);

	return (
		<div className={css.call}>
			<AvatarGroup
				data={call.users.map((user) => ({
					src: staff[user.caller]?.photo ?? '',
					text: staff[user.caller]?.initial ?? '',
					color: staff[user.caller]?.color ?? '',
				}))}
				topPosition={'left'}
				limit={call.users.length}
				size={'small'}
			/>

			<TextField size={'small'} className={css.conference}>
				Конференция...
			</TextField>

			<TextField size={'small'} className={css.timer}>
				{timer}
			</TextField>
		</div>
	);
};
