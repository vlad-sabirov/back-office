import { FC, useCallback, useMemo, useState } from 'react';
import { IMeConferenceProps } from './me-conference.types';
import { StaffAvatar } from '@fsd/entities/staff';
import { VoipService, useVoipActions } from '@fsd/entities/voip';
import { IVoipEventUser } from '@fsd/entities/voip/model/voip-slice-init.types';
import { Hangup } from '@fsd/entities/voip/ui/hangup/Hangup';
import { UserAdd } from '@fsd/entities/voip/ui/user-add/UserAdd';
import { useStateSelector, useTimer, useUser } from '@fsd/shared/lib/hooks';
import { Button, Icon, TextField } from '@fsd/shared/ui-kit';
import { parsePhoneNumber } from '@helpers';
import { Tooltip } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import css from './me-conference.module.scss';

export const MeConference: FC<IMeConferenceProps> = (props) => {
	const { event } = props;
	const staff = useStateSelector((state) => state.staff.data.voip);
	const { user } = useUser();
	const timer = useTimer(event.timestamp);
	const [callMicFetch] = VoipService.callMic();
	const [addFetch] = VoipService.conferenceAdd();
	const actionsVoip = useVoipActions();
	const isFetching = useStateSelector((state) => state.voip.isFetching);
	const [userAddOpen, setUserAddOpen] = useState<boolean>(false);

	const me: IVoipEventUser = useMemo(() => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return event.users.find(
			(callUser) => user?.phoneMobile?.includes(callUser.caller) || user?.phoneVoip == callUser.caller
		)!;
	}, [event.users, user?.phoneMobile, user?.phoneVoip]);

	const handleUserAdd = useCallback(
		async (phone: string) => {
			actionsVoip.setIsFetching(true);
			const res = await addFetch({ uuid: event.uuid, users: [phone] });
			actionsVoip.setIsFetching(false);
			if ('error' in res) {
				// eslint-disable-next-line
				// @ts-ignore
				// noinspection JSUnresolvedReference
				showNotification({ color: 'red', message: res.error.data.message });
			}
		},
		[actionsVoip, addFetch, event.uuid]
	);

	const handleMic = useCallback(async () => {
		actionsVoip.setIsFetching(true);
		const res = await callMicFetch({ uuid: me.uuid });
		actionsVoip.setIsFetching(false);
		if ('error' in res) {
			// eslint-disable-next-line
			// @ts-ignore
			// noinspection JSUnresolvedReference
			showNotification({ color: 'red', message: res.error.data.message });
		}
	}, [actionsVoip, callMicFetch, me.uuid]);

	return (
		<div>
			<div className={css.header}>
				<TextField className={css.type} size={'small'}>
					Конференция...
				</TextField>
				<TextField className={css.timer} size={'small'}>
					{timer}
				</TextField>
			</div>
			<div className={css.wrapper}>
				<div className={css.users}>
					{event.users.map((user) => {
						return (
							<Tooltip
								key={user.caller}
								label={staff[user.caller]?.name || parsePhoneNumber(user.caller).output}
								withArrow
							>
								<div>
									<StaffAvatar user={staff[user.caller]} />
								</div>
							</Tooltip>
						);
					})}
				</div>

				<div className={css.buttons}>
					<Tooltip label={me.mute ? 'Включить микрофон' : 'Отключить микрофон'} withArrow>
						<Button
							className={css.button}
							color={'primary'}
							variant={me.mute ? 'hard' : undefined}
							onClick={handleMic}
							disabled={isFetching}
						>
							<Icon name={'microphone-off'} />
						</Button>
					</Tooltip>

					<UserAdd event={event} onDo={handleUserAdd} isOpen={userAddOpen} setIsOpen={setUserAddOpen}>
						<Tooltip label={'Добавить участника'} withArrow>
							<Button
								color={'primary'}
								className={css.button}
								disabled={isFetching}
								onClick={() => setUserAddOpen(true)}
							>
								<Icon name={'user-add'} />
							</Button>
						</Tooltip>
					</UserAdd>

					<div></div>

					<Hangup event={event}>
						<Tooltip label={'Положить трубку'} withArrow>
							<Button className={css.button} color={'error'} variant={'hard'} disabled={isFetching}>
								<Icon name={'call-hangup'} />
							</Button>
						</Tooltip>
					</Hangup>
				</div>
			</div>
		</div>
	);
};
