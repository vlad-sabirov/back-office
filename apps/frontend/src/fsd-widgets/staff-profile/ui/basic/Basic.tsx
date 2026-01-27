import { FC, useEffect, useMemo, useState } from 'react';
import { IBasicProps } from './basic.types';
import { addDays, format, parseISO, subDays } from 'date-fns';
import { useRouter } from 'next/router';
import { customLocaleRu } from '@config/date-fns.locale';
import TailwindColors from '@config/tailwind/color';
import { StaffAvatar } from '@fsd/entities/staff';
import { IVoipMissingCallsResponse, VoipService } from '@fsd/entities/voip';
import { VoipModalMissingArchiveFeature } from '@fsd/features/voip-modal-missing-archive';
import { useAccess, useUser } from '@fsd/shared/lib/hooks';
import { Button, Icon, TextField } from '@fsd/shared/ui-kit';
import { Indicator, Tooltip } from '@mantine/core';
import css from '../_staff-profile/staff-profile.module.scss';

export const Basic: FC<IBasicProps> = (props) => {
	const { user } = props;
	const { userId: meUserID } = useUser();
	const { query } = useRouter();
	const hasAccessCallHistory = useAccess({ access: ['developer', 'boss'] });
	const isMe = useMemo<boolean>(() => {
		return String(meUserID) == query?.id;
	}, [meUserID, query?.id]);

	const [missingCallsModal, setMissingCallsModal] = useState<boolean>(false);
	const [missingCalls, setMissingCalls] = useState<IVoipMissingCallsResponse[]>([]);
	const [fetchMissed] = VoipService.missingCalls();

	useEffect(() => {
		(async () => {
			const date_start = format(subDays(new Date(), 30), 'yyyy-MM-dd') + 'T00:00:00Z';
			const date_end = format(addDays(new Date(), 1), 'yyyy-MM-dd') + 'T00:00:00Z';
			const phones: string[] = [];
			if (user?.phoneVoip) phones.push(user?.phoneVoip);
			if (user?.phoneMobile) phones.push(user?.phoneMobile.slice(-9));
			const response = await fetchMissed({ date_start, date_end, phones, skip_checked: false });

			if (!('data' in response) || !response.data) return;
			setMissingCalls(response.data.filter((call) => !call.queue).toReversed());
		})();
	}, [fetchMissed, user?.phoneMobile, user?.phoneVoip]);

	if (!user?.id) return null;
	return (
		<>
			{(hasAccessCallHistory || isMe) && (
				<Tooltip label={'Пропущенные звонки за последние 30 дней'} withArrow offset={-4} openDelay={300}>
					<Indicator
						position={'bottom-end'}
						color={TailwindColors.neutral[300]}
						label={missingCalls.length}
						overflowCount={99}
						inline
						size={16}
						offset={7}
						showZero={false}
						dot={false}
						style={{ cursor: 'pointer' }}
						className={css.missedCalls}
						onClick={() => setMissingCallsModal(true)}
					>
						<Button className={css.btMissedCalls} onClick={() => setMissingCallsModal(true)}>
							<Icon name={'call-missed'} />
						</Button>
					</Indicator>
				</Tooltip>
			)}

			<div className={css.avatarInfo}>
				<StaffAvatar user={user} size={'extraLarge'} />

				<div className={css.avatarRight}>
					{!!user.territory?.name && (
						<TextField className={css.simpleBlock}>
							Территория <span>{user.territory?.name}</span>
						</TextField>
					)}

					{!!user.department?.name && (
						<TextField className={css.simpleBlock}>
							Отдел <span>{user.department?.name}</span>
						</TextField>
					)}

					{!!user.birthday && typeof user.birthday === 'string' && (
						<TextField className={css.simpleBlock}>
							День рождения{' '}
							<span>
								{format(parseISO(user.birthday), user.sex === 'male' ? 'dd MMMM yyyyг.' : 'dd MMMM', {
									locale: customLocaleRu,
								})}
							</span>
						</TextField>
					)}
				</div>
			</div>

			<TextField className={css.name} mode={'heading'} size={'small'}>
				{user.lastName} {user.firstName}
			</TextField>

			{user.surName && (
				<TextField className={css.surName} mode={'heading'} size={'small'}>
					{user.surName}
				</TextField>
			)}

			{user.workPosition && <TextField className={css.workPosition}>{user.workPosition}</TextField>}

			<VoipModalMissingArchiveFeature
				calls={missingCalls}
				isOpen={missingCallsModal}
				setIsOpen={setMissingCallsModal}
			/>
		</>
	);
};
