import { FC, useMemo, useState } from 'react';
import { IUserAddProps } from './user-add.types';
import { useStateSelector, useUser } from '@fsd/shared/lib/hooks';
import { parsePhoneNumber } from '@fsd/shared/lib/parsePhoneNumber';
import { Button, Icon, Input } from '@fsd/shared/ui-kit';
import { Popover } from '@mantine/core';
import { useClickOutside } from '@mantine/hooks';
import { StaffHelperP2P } from '../staff-helper-p2p/StaffHelperP2P';
import css from 'fsd-entities/voip/ui/user-add/user-add.module.scss';

export const UserAdd: FC<IUserAddProps> = (props) => {
	const { children, event, onDo, isOpen, setIsOpen } = props;
	const [inputNumber, setInputNumber] = useState<string>('');
	const [isShowStaffHelper, setIsShowStaffHelper] = useState<boolean>(false);
	const { user } = useUser();
	const isFetching = useStateSelector((state) => state.voip.isFetching);
	const ref = useClickOutside(() => setIsOpen(false));
	const validPhone: boolean = useMemo(() => parsePhoneNumber(inputNumber).valid, [inputNumber]);

	return (
		<Popover
			width={320}
			withArrow
			arrowSize={12}
			shadow={'xl'}
			offset={-4}
			radius={'md'}
			position={'top'}
			opened={isOpen}
			onChange={setIsOpen}
		>
			<Popover.Target>{children}</Popover.Target>
			<Popover.Dropdown>
				<form
					className={css.form}
					onSubmit={(event) => {
						event.preventDefault();
						onDo(inputNumber);
						setIsOpen(false);
						setIsShowStaffHelper(false);
					}}
					ref={ref}
				>
					<StaffHelperP2P
						width={320}
						height={320}
						searchInput={inputNumber}
						isOpen={isShowStaffHelper}
						setIsOpen={setIsShowStaffHelper}
						onDo={(phone) => {
							onDo(phone);
							setIsOpen(false);
							setIsShowStaffHelper(false);
						}}
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
