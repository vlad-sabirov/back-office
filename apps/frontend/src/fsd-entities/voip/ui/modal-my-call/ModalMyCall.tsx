import { FC, useCallback, useMemo, useState } from 'react';
import cn from 'classnames';
import Head from 'next/head';
import { useCrmCardShowContact, useCrmCardShowOrganization } from '@fsd/entities/crm-card';
import { ICrmContactVoip } from '@fsd/entities/crm-contact/model/slice.types';
import { ICrmOrganizationVoip } from '@fsd/entities/crm-organization/model/slice.types';
import { IStaffVoip } from '@fsd/entities/staff';
import { VoipService } from '@fsd/entities/voip';
import { IVoipEventUser } from '@fsd/entities/voip/model/voip-slice-init.types';
import { Hangup } from '@fsd/entities/voip/ui/hangup/Hangup';
import { Redirect } from '@fsd/entities/voip/ui/redirect/Redirect';
import { UserAdd } from '@fsd/entities/voip/ui/user-add/UserAdd';
import { useStateSelector, useTimer, useUser } from '@fsd/shared/lib/hooks';
import { parsePhoneNumber } from '@fsd/shared/lib/parsePhoneNumber';
import { Avatar, Button, Icon, TextField } from '@fsd/shared/ui-kit';
import { Overlay, Portal, Tooltip } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useActions } from '../../lib';
import css from './modal-my-call.module.scss';

type IType = { type: 'organization' | 'contact' };

export const ModalMyCall: FC = () => {
	const call = useStateSelector((state) => state.voip.data.my);
	const isShow = useStateSelector((state) => state.voip.callModal.isShowModal);
	const actions = useActions();
	const { user } = useUser();
	const staff = useStateSelector((state) => state.staff.data.voip);
	const org = useStateSelector((state) => state.crm_organization.data.voip);
	const cont = useStateSelector((state) => state.crm_contact.data.voip);
	const showOrg = useCrmCardShowOrganization();
	const showCont = useCrmCardShowContact();
	const timer = useTimer(call?.timestamp || null);

	const [userAddOpen, setUserAddOpen] = useState(false);
	const [callMicFetch] = VoipService.callMic();
	const [callMorphP2PToConferenceFetch] = VoipService.callMorphP2PToConference();

	const handleModalClose = useCallback(() => {
		actions.setCallModalIsShow(false);
	}, [actions]);

	const { type, me, enemy }: { type: 'out' | 'in'; me: IVoipEventUser | null; enemy: IVoipEventUser | null } =
		useMemo(() => {
			if (!call) {
				return { type: 'in', me: null, enemy: null };
			}
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const me = call.users.find(
				(callUser) => user?.phoneMobile?.includes(callUser.caller) || user?.phoneVoip == callUser.caller
			)!;
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const enemy = call.users.find((callUser) => callUser.uuid != me?.uuid)!;
			return {
				type: me.role === 'caller' ? 'out' : 'in',
				me,
				enemy,
			};
		}, [call, user?.phoneMobile, user?.phoneVoip]);

	const enemyUser: IStaffVoip | null = useMemo(() => {
		if (!enemy) return null;
		if (staff[enemy.caller]) {
			return staff[enemy.caller];
		}
		return null;
	}, [enemy, staff]);

	const enemyCRM = useMemo<(ICrmOrganizationVoip & IType) | (ICrmContactVoip & IType) | null>(() => {
		if (!enemy) return null;
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
	}, [cont, enemy, org]);

	const handleMorphToConference = useCallback(
		async (phone: string) => {
			if (!call) return;
			actions.setIsFetching(true);
			const res = await callMorphP2PToConferenceFetch({ uuid: call.uuid, new_users: [phone] });
			actions.setIsFetching(false);
			if ('error' in res) {
				// eslint-disable-next-line
				// @ts-ignore
				// noinspection JSUnresolvedReference
				showNotification({ color: 'red', message: res.error.data.message });
			}
		},
		[actions, call, callMorphP2PToConferenceFetch]
	);

	const handleMic = useCallback(async () => {
		if (!me) return;
		actions.setIsFetching(true);
		const res = await callMicFetch({ uuid: me.uuid });
		actions.setIsFetching(false);
		if ('error' in res) {
			// eslint-disable-next-line
			// @ts-ignore
			// noinspection JSUnresolvedReference
			showNotification({ color: 'red', message: res.error.data.message });
		}
	}, [actions, callMicFetch, me]);

	if (!isShow || !enemy || !me || !call) return null;
	return (
		<Portal>
			<Head>
				<title>Входящий звонок!</title>
			</Head>

			<Overlay color={'#000'} opacity={0.6} translate={'no'} zIndex={1000} onClick={handleModalClose} />
			<div className={css.root}>
				<Icon name={'close-medium'} className={css.close} onClick={handleModalClose} />

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
												actions.setCallModalIsShow(false);
											}
											if (enemyCRM?.type === 'contact') {
												showCont({ id: enemyCRM.id });
												actions.setCallModalIsShow(false);
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
							>
								<Icon name={'microphone-off'} />
							</Button>
						</Tooltip>

						<UserAdd
							event={call}
							onDo={handleMorphToConference}
							isOpen={userAddOpen}
							setIsOpen={setUserAddOpen}
						>
							<Tooltip label={'Создать конференцию на базе звонка'} withArrow>
								<Button color={'primary'} className={css.button} onClick={() => setUserAddOpen(true)}>
									<Icon name={'user-add'} />
								</Button>
							</Tooltip>
						</UserAdd>

						<Redirect event={call}>
							<Tooltip label={'Переадресовать звонок'} withArrow>
								<Button color={'primary'} className={css.button}>
									<Icon name={'call-redirect'} />
								</Button>
							</Tooltip>
						</Redirect>

						<div></div>

						<Hangup event={call}>
							<Tooltip label={'Положить трубку'} withArrow>
								<Button className={css.button} color={'error'} variant={'hard'}>
									<Icon name={'call-hangup'} />
								</Button>
							</Tooltip>
						</Hangup>
					</div>
				</div>
			</div>
		</Portal>
	);
};
