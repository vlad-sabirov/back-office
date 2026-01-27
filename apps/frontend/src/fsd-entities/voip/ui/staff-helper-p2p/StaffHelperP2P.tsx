import { FC, useMemo } from 'react';
import { IStaffHelperP2PProps } from './staff-helper-p2p.types';
import classNames from 'classnames';
import { IStaffEntity, StaffAvatar } from '@fsd/entities/staff';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Icon, Menu, TextField } from '@fsd/shared/ui-kit';
import { Popover, ScrollArea } from '@mantine/core';
import { useClickOutside } from '@mantine/hooks';
import css from './staff-helper-p2p.module.scss';

export const StaffHelperP2P: FC<IStaffHelperP2PProps> = (props) => {
	const { width, height, children, isOpen, setIsOpen, onDo, searchInput, ignorePhones } = props;
	const ref = useClickOutside(() => setIsOpen(false));
	const staff = useStateSelector((state) => state.staff.data.worked).filter(
		(user) => !(ignorePhones?.includes(user.phoneVoip) || ignorePhones?.includes(user.phoneMobile.slice(-9)))
	);
	const events = useStateSelector((state) => state.voip.data.events);
	const eventPhones = useMemo<string[]>(() => {
		const result: string[] = [];
		events.forEach((event) => {
			event.users.forEach((user) => {
				result.push(user.caller);
			});
		});
		return result;
	}, [events]);

	const constDisplayStaff: IStaffEntity[] = useMemo(() => {
		const searchClean = searchInput.replace(/\s+/g, ' ').toLowerCase();
		if (!searchClean.length) {
			return staff;
		}
		const searchSplit = searchClean.split(' ');
		let filteredStaff = staff;
		for (const searchInput of searchSplit) {
			const search = searchInput.replace(/[^a-zа-я0-9]/g, '');
			filteredStaff = filteredStaff.filter((user) => {
				if (user.lastName.toLowerCase().includes(search)) return true;
				if (user.firstName.toLowerCase().includes(search)) return user;
				if (user.phoneVoip.includes(search)) return user;
				if (user.phoneMobile.includes(search)) return user;
				return false;
			});
		}
		return filteredStaff;
	}, [staff, searchInput]);

	return (
		<div ref={ref}>
			<Popover
				opened={isOpen}
				onChange={setIsOpen}
				width={width}
				withArrow
				arrowSize={12}
				shadow={'xl'}
				offset={-4}
				radius={'md'}
			>
				<Popover.Target>{children}</Popover.Target>
				<Popover.Dropdown>
					<ScrollArea style={{ height }}>
						<div className={css.dropdown}>
							{constDisplayStaff.map((user) => {
								const isCalling: boolean =
									eventPhones.includes(user.phoneVoip) ||
									eventPhones.includes(user.phoneMobile.slice(-9));
								return (
									<Menu
										key={user.id}
										offset={-8}
										shadow={'xl'}
										radius={'md'}
										control={
											<div
												className={classNames(css.user, {
													[css.userDisabled]: isCalling,
												})}
											>
												<StaffAvatar user={user} size={'small'} />
												<TextField className={css.userName}>
													{user.lastName} {user.firstName}
												</TextField>
												{isCalling && <Icon name={'call-phone'} className={css.calling} />}
											</div>
										}
										disabled={isCalling}
									>
										{user.phoneVoip && (
											<Menu.Item
												icon={<Icon name={'call-phone'} />}
												onClick={() => {
													onDo(user.phoneVoip, `${user.lastName} ${user.firstName}`);
													setIsOpen(false);
												}}
												color={'orange'}
											>
												Внутренний
											</Menu.Item>
										)}
										{user.phoneMobile && (
											<Menu.Item
												icon={<Icon name={'call-mobile'} />}
												onClick={() => {
													onDo(
														user.phoneMobile.slice(-9),
														`${user.lastName} ${user.firstName}`
													);
													setIsOpen(false);
												}}
												color={'orange'}
											>
												Мобильный
											</Menu.Item>
										)}
									</Menu>
								);
							})}
						</div>
					</ScrollArea>
				</Popover.Dropdown>
			</Popover>
		</div>
	);
};
