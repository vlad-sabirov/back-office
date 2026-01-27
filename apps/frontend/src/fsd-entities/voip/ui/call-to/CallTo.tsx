import { FC, useCallback, useState } from 'react';
import { useCallP2P, useVoipActions } from '@fsd/entities/voip';
import { ICallToProps } from '@fsd/entities/voip/ui/call-to/call-to.types';
import { useUser } from '@fsd/shared/lib/hooks';
import { parsePhoneNumber } from '@fsd/shared/lib/parsePhoneNumber';
import { Button, Icon, TextField } from '@fsd/shared/ui-kit';
import { Popover } from '@mantine/core';
import css from './call-to.module.scss';

export const CallTo: FC<ICallToProps> = (props) => {
	const [isDisplayPopup, setIsDisplayPopup] = useState<boolean>(false);
	const { callToName, callToPhone, children, offset, width } = props;
	const { user } = useUser();
	const call = useCallP2P();
	const actions = useVoipActions();

	const handleCall = useCallback(
		async (caller: string) => {
			setIsDisplayPopup(false);
			actions.setIsFetching(true);
			await call({
				caller: parsePhoneNumber(caller).clear.slice(-9),
				receiver: parsePhoneNumber(callToPhone).clear.slice(-9),
			});
			actions.setIsFetching(false);
		},
		[actions, call, callToPhone]
	);

	return (
		<Popover
			radius={'md'}
			width={width ?? 300}
			shadow={'xl'}
			offset={offset}
			opened={isDisplayPopup}
			onChange={setIsDisplayPopup}
			withArrow
		>
			{/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
			{/*@ts-ignore*/}
			<Popover.Target onClick={() => setIsDisplayPopup(true)}>{children}</Popover.Target>
			<Popover.Dropdown className={css.root}>
				<Icon name={'close-medium'} className={css.close} onClick={() => setIsDisplayPopup(false)} />
				<TextField className={css.title} size={'large'}>
					Откуда позвонить?
				</TextField>

				{!!callToName && (
					<TextField size={'small'} className={css.name}>
						{callToName}
					</TextField>
				)}

				<TextField className={css.phone}>{parsePhoneNumber(callToPhone).output}</TextField>

				<div className={css.buttons}>
					{!!user?.phoneVoip && (
						<Button
							size={'small'}
							iconLeft={<Icon name={'call-phone'} />}
							onClick={() => handleCall(user.phoneVoip)}
						>
							Внутренний
						</Button>
					)}

					{!!user?.phoneMobile && (
						<Button
							size={'small'}
							iconLeft={<Icon name={'call-mobile'} />}
							onClick={() => handleCall(user.phoneMobile)}
						>
							Мобильный
						</Button>
					)}
				</div>
			</Popover.Dropdown>
		</Popover>
	);
};
