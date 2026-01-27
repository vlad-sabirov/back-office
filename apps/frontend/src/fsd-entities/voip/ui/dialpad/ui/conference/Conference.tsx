import { FC, useCallback, useMemo, useState } from 'react';
import { IConferenceUser } from './conference.types';
import { StaffHelperP2P } from '@fsd/entities/voip/ui/staff-helper-p2p/StaffHelperP2P';
import { useStateSelector, useUser } from '@fsd/shared/lib/hooks';
import { parsePhoneNumber } from '@fsd/shared/lib/parsePhoneNumber';
import { Button, Icon, Input, TextField } from '@fsd/shared/ui-kit';
import { Tooltip } from '@mantine/core';
import { useCallConference } from '../../../../lib';
import css from '../../dialpad.module.scss';

export const Conference: FC = () => {
	const isFetching = useStateSelector((state) => state.voip.isFetching);
	const [inputNumber, setInputNumber] = useState<string>('');
	const [inputError, setInputError] = useState<string>('');
	const { user } = useUser();
	const [isShowStaffHelper, setIsShowStaffHelper] = useState<boolean>(false);
	const [users, setUsers] = useState<IConferenceUser[]>([]);
	const createConference = useCallConference();
	const validPhone: boolean = useMemo(() => parsePhoneNumber(inputNumber).valid, [inputNumber]);

	const handleAddUser = useCallback((user: IConferenceUser) => {
		setUsers((old) => {
			old.push(user);
			return old;
		});
	}, []);

	const handleManualAdd = useCallback(
		(input: string) => {
			setIsShowStaffHelper(false);
			const phone = parsePhoneNumber(input);

			if (!phone.valid) {
				setInputError('Неверный формат');
				return;
			}

			if (users.some((user) => user.phone === phone.output)) {
				setInputError('Дубликат номера');
				return;
			}

			setInputNumber('');
			handleAddUser({ phone: phone.clear, name: phone.output });
		},
		[handleAddUser, users]
	);

	const handleRemoveUser = useCallback((phone: string) => {
		setUsers((old) => old.filter((old) => old.phone !== phone));
	}, []);

	return (
		<div className={css.conference}>
			<form
				className={css.dialpad}
				onSubmit={(event) => {
					event.preventDefault();
					handleManualAdd(inputNumber);
				}}
			>
				<StaffHelperP2P
					width={320}
					height={320}
					searchInput={inputNumber}
					isOpen={isShowStaffHelper}
					setIsOpen={setIsShowStaffHelper}
					onDo={(phone, name) => {
						handleAddUser({ phone, name });
						setInputNumber('');
					}}
					ignorePhones={[user?.phoneVoip || '', user?.phoneMobile || '', ...users.map(({ phone }) => phone)]}
				>
					<Input
						value={inputNumber}
						onChange={(event) => {
							if (inputError.length > 0) {
								setInputError('');
							} else if (!isShowStaffHelper) {
								setIsShowStaffHelper(true);
							}
							setInputNumber(event.currentTarget.value);
						}}
						onFocus={() => setIsShowStaffHelper(true)}
						iconLeft={<Icon name={'users'} />}
						disabled={isFetching || !user?.phoneMobile}
						error={inputError}
					/>
				</StaffHelperP2P>

				<Tooltip label={'Добавить в конйеренцию'} withArrow>
					<Button
						className={css.add}
						color={'info'}
						variant={'hard'}
						type={'submit'}
						disabled={inputNumber.length < 3 || !validPhone}
					>
						<Icon name={'user-add'} />
					</Button>
				</Tooltip>
			</form>

			{users.length > 0 ? (
				<>
					<div className={css.conferenceUsersTitle}>
						<TextField size={'small'}>Участники</TextField>
						<TextField size={'small'}>{users.length + 1} чел.</TextField>
					</div>

					<div className={css.conferenceUsers}>
						<TextField size={'small'}>
							1. {user?.lastName} {user?.firstName}
							<Tooltip label={'Внутренний номер'} withArrow>
								<span className={css.icon}>
									<Icon name={'call-phone'} />
								</span>
							</Tooltip>
						</TextField>
						<div />
					</div>

					{users.map((user, i) => {
						return (
							<div key={user.phone} className={css.conferenceUsers}>
								<TextField size={'small'}>
									{i + 2}. {user.name}
									{user.phone.length === 3 ? (
										<Tooltip label={'Внутренний номер'} withArrow>
											<span className={css.icon}>
												<Icon name={'call-phone'} />
											</span>
										</Tooltip>
									) : (
										<Tooltip label={'Мобильный телефон'} withArrow>
											<span className={css.icon}>
												<Icon name={'call-mobile'} />
											</span>
										</Tooltip>
									)}
								</TextField>
								<Tooltip label={'Удалить из конференции'} withArrow>
									<div>
										<Icon
											name={'close-medium'}
											className={css.conferenceUsersRemove}
											onClick={() => handleRemoveUser(user.phone)}
										/>
									</div>
								</Tooltip>
							</div>
						);
					})}

					<div className={css.conferenceCreate}>
						<Tooltip label={'Создать конференцию с указанными участниками'} withArrow>
							<Button
								iconLeft={<Icon name={'phone-f'} />}
								color={'primary'}
								variant={'hard'}
								className={css.conferenceCreate__button}
								onClick={() => createConference(users.map(({ phone }) => phone))}
							>
								Начать конференцию
							</Button>
						</Tooltip>
					</div>
				</>
			) : null}
		</div>
	);
};
