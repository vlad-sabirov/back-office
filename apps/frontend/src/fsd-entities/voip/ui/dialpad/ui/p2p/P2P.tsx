import { FC, useMemo, useState } from 'react';
import { useCallP2P } from '@fsd/entities/voip';
import { StaffHelperP2P } from '@fsd/entities/voip/ui/staff-helper-p2p/StaffHelperP2P';
import { useStateSelector, useUser } from '@fsd/shared/lib/hooks';
import { Button, Icon, Input } from '@fsd/shared/ui-kit';
import { parsePhoneNumber } from '@helpers';
import { Tooltip } from '@mantine/core';
import css from '../../dialpad.module.scss';

export const P2P: FC = () => {
	const isFetching = useStateSelector((state) => state.voip.isFetching);
	const [inputNumber, setInputNumber] = useState<string>('');
	const { user } = useUser();
	const [isShowStaffHelper, setIsShowStaffHelper] = useState<boolean>(false);
	const callP2P = useCallP2P();
	const validPhone: boolean = useMemo(() => parsePhoneNumber(inputNumber).valid, [inputNumber]);

	return (
		<div className={css.p2p}>
			<form
				className={css.dialpad}
				onSubmit={(event) => {
					event.preventDefault();
					setIsShowStaffHelper(false);
					callP2P({ receiver: inputNumber }).then();
				}}
			>
				<StaffHelperP2P
					width={320}
					height={320}
					searchInput={inputNumber}
					isOpen={isShowStaffHelper}
					setIsOpen={setIsShowStaffHelper}
					onDo={(phone) => callP2P({ receiver: phone })}
					ignorePhones={[user?.phoneVoip || '', user?.phoneMobile || '']}
				>
					<Input
						value={inputNumber}
						onChange={(event) => setInputNumber(event.currentTarget.value)}
						onFocus={() => setIsShowStaffHelper(true)}
						iconLeft={<Icon name={'users-singleton'} />}
						disabled={isFetching || !user?.phoneMobile}
					/>
				</StaffHelperP2P>

				<Tooltip label={'Позвонить на номер'} withArrow>
					<Button
						className={css.call}
						color={'primary'}
						variant={'hard'}
						type={'submit'}
						disabled={isFetching || !user?.phoneMobile || !validPhone}
					>
						<Icon name={'phone-f'} />
					</Button>
				</Tooltip>
			</form>
		</div>
	);
};
