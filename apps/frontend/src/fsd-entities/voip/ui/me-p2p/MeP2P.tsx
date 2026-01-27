import { FC, useCallback, useMemo, useState } from 'react';
import { IMeP2pProps } from './me-p2p.types';
import cn from 'classnames';
import { useCrmCardShowContact, useCrmCardShowOrganization } from '@fsd/entities/crm-card';
import { ICrmContactVoip } from '@fsd/entities/crm-contact/model/slice.types';
import { ICrmOrganizationVoip } from '@fsd/entities/crm-organization/model/slice.types';
import { IStaffVoip } from '@fsd/entities/staff';
import { VoipService, useVoipActions } from '@fsd/entities/voip';
import { UserAdd } from '@fsd/entities/voip/ui/user-add/UserAdd';
import { useStateSelector, useTimer, useUser } from '@fsd/shared/lib/hooks';
import { parsePhoneNumber } from '@fsd/shared/lib/parsePhoneNumber';
import { Avatar, Button, Icon, TextField } from '@fsd/shared/ui-kit';
import { Tooltip } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IVoipEventUser } from '../../model/voip-slice-init.types';
import { Hangup } from '../hangup/Hangup';
import { Redirect } from '../redirect/Redirect';
import css from './me-p2p.module.scss';

type IType = { type: 'organization' | 'contact' };

export const MeP2P: FC<IMeP2pProps> = (props) => {
	const { event, isShowPopover } = props;
	const staff = useStateSelector((state) => state.staff.data.voip);
	const { user } = useUser();
	const [callMicFetch] = VoipService.callMic();
	const [callMorphP2PToConferenceFetch] = VoipService.callMorphP2PToConference();
	const actionsVoip = useVoipActions();
	const isFetching = useStateSelector((state) => state.voip.isFetching);
	const timer = useTimer(event.timestamp);
	const [userAddOpen, setUserAddOpen] = useState<boolean>(false);

	const org = useStateSelector((state) => state.crm_organization.data.voip);
	const cont = useStateSelector((state) => state.crm_contact.data.voip);
	const showOrg = useCrmCardShowOrganization();
	const showCont = useCrmCardShowContact();

	const { type, me, enemy }: { type: 'out' | 'in'; me: IVoipEventUser; enemy: IVoipEventUser } = useMemo(() => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const me = event.users.find(
			(callUser) => user?.phoneMobile?.includes(callUser.caller) || user?.phoneVoip == callUser.caller
		)!;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const enemy = event.users.find((callUser) => callUser.uuid != me?.uuid)!;
		return {
			type: me.role === 'caller' ? 'out' : 'in',
			me,
			enemy,
		};
	}, [event.users, user?.phoneMobile, user?.phoneVoip]);

	const enemyUser: IStaffVoip | null = useMemo(() => {
		if (staff[enemy.caller]) {
			return staff[enemy.caller];
		}
		return null;
	}, [enemy.caller, staff]);

	const enemyCRM = useMemo<(ICrmOrganizationVoip & IType) | (ICrmContactVoip & IType) | null>(() => {
		let result: (ICrmOrganizationVoip & IType) | (ICrmContactVoip & IType) | null = null;
		if (org[enemy.caller]) {
			result = {
				id: org[enemy.caller].id,
				name: org[enemy.caller].name,
				phone: org[enemy.caller].phone,
				type: 'organization',
			};
		} else if (cont[enemy.caller]) {
			result = {
				id: cont[enemy.caller].id,
				name: cont[enemy.caller].name,
				phone: cont[enemy.caller].phone,
				type: 'contact',
			};
		}
		return result;
	}, [cont, enemy.caller, org]);

	const handleMorphToConference = useCallback(
		async (phone: string) => {
			actionsVoip.setIsFetching(true);
			const res = await callMorphP2PToConferenceFetch({ uuid: event.uuid, new_users: [phone] });
			actionsVoip.setIsFetching(false);
			if ('error' in res) {
				// eslint-disable-next-line
				// @ts-ignore
				// noinspection JSUnresolvedReference
				showNotification({ color: 'red', message: res.error.data.message });
			}
		},
		[actionsVoip, callMorphP2PToConferenceFetch, event.uuid]
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
					{type === 'in' ? 'Входящий звонок...' : 'Исходящий звонок...'}
				</TextField>
				<TextField className={css.timer} size={'small'}>
					{timer}
				</TextField>
			</div>
			<div className={css.wrapper}>
				<div className={css.enemy}>
					{enemyUser && (
						<>
							<Avatar
								src={enemyUser.photo}
								color={enemyUser.color}
								text={enemyUser.initial}
								size={'large'}
							/>
							<div>
								<TextField className={css.enemyName}>{enemyUser.name}</TextField>
								<TextField className={css.enemyNumber} size={'small'}>
									{parsePhoneNumber(enemy.caller).output}
								</TextField>
							</div>
						</>
					)}

					{enemyCRM && (
						<>
							<div className={css.avatarIcon}>
								<Icon name={'crm'} />
							</div>
							<div>
								<TextField
									className={cn(css.enemyName, css.pointer)}
									onClick={() => {
										if (enemyCRM?.type === 'organization') {
											showOrg({ id: enemyCRM.id });
											isShowPopover(false);
										}
										if (enemyCRM?.type === 'contact') {
											showCont({ id: enemyCRM.id });
											isShowPopover(false);
										}
									}}
								>
									{enemyCRM.name}
								</TextField>

								<TextField className={css.enemyNumber} size={'small'}>
									{parsePhoneNumber(enemy.caller).output}
								</TextField>
							</div>
						</>
					)}

					{!enemyUser && !enemyCRM && (
						<>
							<Avatar size={'large'} />
							<div>
								<TextField className={css.enemyName}>Неизвестный номер</TextField>
								<TextField className={css.enemyNumber} size={'small'}>
									{parsePhoneNumber(enemy.caller).output}
								</TextField>
							</div>
						</>
					)}
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

					<UserAdd
						event={event}
						onDo={handleMorphToConference}
						isOpen={userAddOpen}
						setIsOpen={setUserAddOpen}
					>
						<Tooltip label={'Создать конференцию на базе звонка'} withArrow>
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

					<Redirect event={event}>
						<Tooltip label={'Переадресовать звонок'} withArrow>
							<Button color={'primary'} className={css.button} disabled={isFetching}>
								<Icon name={'call-redirect'} />
							</Button>
						</Tooltip>
					</Redirect>

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
