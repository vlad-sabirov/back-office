// noinspection DuplicatedCode
// noinspection DuplicatedCode
import { FC, useEffect, useMemo, useState } from 'react';
import { differenceInSeconds, parseISO } from 'date-fns';
import { ICallerProps } from '@fsd/entities/voip/ui/calls/caller.types';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { AvatarGroup, AvatarProps, TextField } from '@fsd/shared/ui-kit';
import css from '../callers.module.scss';

export const P2P: FC<ICallerProps> = (props) => {
	const { call } = props;
	const staff = useStateSelector((state) => state.staff.data.voip);
	const [timer, setTimer] = useState<string>('');

	const caller = useMemo(() => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return call.users.find((user) => user.role == 'caller')!;
	}, [call]);
	const callerUser = useMemo(() => staff[caller.caller], [staff, caller.caller]);

	const receiver = useMemo(() => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return call.users.find((user) => user.role == 'receiver')!;
	}, [call]);
	const receiverUser = useMemo(() => staff[receiver.caller], [staff, receiver.caller]);

	const avatars = useMemo<Omit<AvatarProps, 'size' | 'className'>[]>(() => {
		const avatars: Omit<AvatarProps, 'size' | 'className'>[] = [];

		if (callerUser) {
			avatars.push({ src: callerUser.photo, color: callerUser.color, text: callerUser.initial });
		} else {
			avatars.push({});
		}

		if (receiverUser) {
			avatars.push({ src: receiverUser.photo, color: receiverUser.color, text: receiverUser.initial });
		} else {
			avatars.push({});
		}

		return avatars;
	}, [callerUser, receiverUser]);

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
			<AvatarGroup data={avatars} topPosition={'left'} limit={2} size={'small'} />
			<div>
				<TextField size={'small'} className={css.user}>
					{callerUser ? callerUser.name : 'Внешний номер'}
				</TextField>

				<TextField size={'small'} className={css.user}>
					{receiverUser ? receiverUser.name : 'Внешний номер'}
				</TextField>
			</div>

			<TextField size={'small'} className={css.timer}>
				{timer}
			</TextField>
		</div>
	);
};
