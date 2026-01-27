import { FC, useCallback, useMemo, useState } from 'react';
import { VoipService, useVoipActions } from '@fsd/entities/voip';
import { IVoipEventUser } from '@fsd/entities/voip/model/voip-slice-init.types';
import { IHangupProps } from '@fsd/entities/voip/ui/hangup/hangup.types';
import { useUser } from '@fsd/shared/lib/hooks';
import { Button, Icon, TextField } from '@fsd/shared/ui-kit';
import { Popover } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import css from './hangup.module.scss';

export const Hangup: FC<IHangupProps> = (props) => {
	const { event, children } = props;

	const [callHangupFetch] = VoipService.callHangup();
	const actionsVoip = useVoipActions();
	const { user } = useUser();
	const [isShow, setIsShow] = useState<boolean>(false);

	const me: IVoipEventUser = useMemo(() => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return event.users.find(
			(callUser) => user?.phoneMobile?.includes(callUser.caller) || user?.phoneVoip == callUser.caller
		)!;
	}, [event.users, user?.phoneMobile, user?.phoneVoip]);

	const handleHangup = useCallback(async () => {
		actionsVoip.setIsFetching(true);
		const res = await callHangupFetch({ uuid: me.uuid });
		actionsVoip.setIsFetching(false);
		if ('error' in res) {
			// eslint-disable-next-line
			// @ts-ignore
			// noinspection JSUnresolvedReference
			showNotification({ color: 'red', message: res.error.data.message });
		}
	}, [actionsVoip, callHangupFetch, me.uuid]);

	return (
		<Popover
			width={280}
			arrowSize={12}
			shadow={'xl'}
			offset={-4}
			radius={'md'}
			position={'left-end'}
			opened={isShow}
			onChange={setIsShow}
			withArrow
		>
			<Popover.Target
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				onClick={() => setIsShow(true)}
			>
				{children}
			</Popover.Target>
			<Popover.Dropdown>
				<TextField mode={'heading'} size={'small'}>
					Положить трубку?
				</TextField>

				<div className={css.buttons}>
					<Button onClick={() => setIsShow(false)}>Отмена</Button>

					<Button
						iconLeft={<Icon name={'call-hangup'} />}
						color={'error'}
						variant={'hard'}
						onClick={handleHangup}
					>
						Положить
					</Button>
				</div>
			</Popover.Dropdown>
		</Popover>
	);
};
