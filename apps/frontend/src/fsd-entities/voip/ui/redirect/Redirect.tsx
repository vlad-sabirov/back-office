import { FC, useCallback, useMemo, useState } from 'react';
import { IRedirectProps } from './redirect.types';
import { VoipService, useVoipActions } from '@fsd/entities/voip';
import { useStateSelector, useUser } from '@fsd/shared/lib/hooks';
import { parsePhoneNumber } from '@fsd/shared/lib/parsePhoneNumber';
import { Button, Icon, Input } from '@fsd/shared/ui-kit';
import { Popover } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IVoipEventUser } from '../../model/voip-slice-init.types';
import { StaffHelperP2P } from '../staff-helper-p2p/StaffHelperP2P';
import css from './redirect.module.scss';

export const Redirect: FC<IRedirectProps> = (props) => {
	const { children, event } = props;
	const [inputNumber, setInputNumber] = useState<string>('');
	const [isShowStaffHelper, setIsShowStaffHelper] = useState<boolean>(false);
	const { user } = useUser();
	const validPhone: boolean = useMemo(() => parsePhoneNumber(inputNumber).valid, [inputNumber]);
	const isFetching = useStateSelector((state) => state.voip.isFetching);
	const [redirectFetch] = VoipService.p2pRedirect();
	const actionsVoip = useVoipActions();

	const caller = useMemo<IVoipEventUser | null>(() => {
		if (!user) {
			return null;
		}
		for (const eventUser of event.users) {
			if (!user.phoneMobile.includes(eventUser.caller) && user.phoneVoip != eventUser.caller) {
				return eventUser;
			}
		}
		return null;
	}, [event.users, user]);

	const handleRedirect = useCallback(
		async (receiver: string) => {
			actionsVoip.setIsFetching(true);
			const res = await redirectFetch({ uuid: caller?.uuid || '', receiver });
			actionsVoip.setIsFetching(false);
			if ('error' in res) {
				// eslint-disable-next-line
				// @ts-ignore
				// noinspection JSUnresolvedReference
				showNotification({ color: 'red', message: res.error.data.message });
			}
		},
		[actionsVoip, redirectFetch, caller]
	);

	return (
		<Popover width={320} withArrow arrowSize={12} shadow={'xl'} offset={-4} radius={'md'} position={'top'}>
			<Popover.Target>{children}</Popover.Target>
			<Popover.Dropdown>
				<form
					className={css.form}
					onSubmit={(event) => {
						event.preventDefault();
						handleRedirect(inputNumber).then();
					}}
				>
					<StaffHelperP2P
						width={320}
						height={320}
						searchInput={inputNumber}
						isOpen={isShowStaffHelper}
						setIsOpen={setIsShowStaffHelper}
						onDo={(phone) => handleRedirect(phone)}
						ignorePhones={[
							user?.phoneVoip || '',
							user?.phoneMobile || '',
							...event.users.map(({ caller }) => caller),
						]}
					>
						<Input
							label={'Номер или имя'}
							value={inputNumber}
							onChange={(event) => setInputNumber(event.currentTarget.value)}
							onFocus={() => setIsShowStaffHelper(true)}
							disabled={isFetching || !user?.phoneMobile}
						/>
					</StaffHelperP2P>

					<Button color={'primary'} className={css.callButton} disabled={isFetching || !validPhone}>
						<Icon name={'phone-f'} />
					</Button>
				</form>
			</Popover.Dropdown>
		</Popover>
	);
};
