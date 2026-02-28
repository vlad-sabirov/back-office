import { FC, useEffect, useMemo, useState } from 'react';
import { VoipIncomingListFeature } from 'fsd-features/voip-incoming-list';
import { VoipService, useVoipActions } from '@fsd/entities/voip';
import { IAnalyticsResponse } from '@fsd/entities/voip/api/res/analytics.res';
import { VoipIncomingBoardsFeature } from '@fsd/features/voip-incoming-boards';
import { useStateSelector, useUser } from '@fsd/shared/lib/hooks';
import { Header } from '@fsd/shared/ui-kit';
import { HeaderRight } from '../header-right/HeaderRight';

const FULL_ACCESS_ROLES = ['developer', 'crmAdmin', 'boss'];

const ALL_COMPANY_PHONES = [
	'1503994',
	'1503995',
	'1503996',
	'1503997',
	'1503946',
	'1503920',
	'5119494',
	'5119696',
	'5119797',
	'5118282',
];

const Incoming: FC = () => {
	const isLoading = useStateSelector((state) => state.voip.isLoading);
	const isFetching = useStateSelector((state) => state.voip.isFetching);
	const date = useStateSelector((state) => state.voip.config.incoming.date);
	const [fetchGetAnalytics] = VoipService.analytics();
	const [data, setData] = useState<IAnalyticsResponse | null>(null);

	const { user, getRoles } = useUser();
	const roles = getRoles();
	const isFullAccess = roles?.some((role) => FULL_ACCESS_ROLES.includes(role)) ?? false;
	const phones = useMemo(() => {
		if (isFullAccess) return ALL_COMPANY_PHONES;
		return user?.phoneVoip ? [user.phoneVoip] : [];
	}, [isFullAccess, user?.phoneVoip]);

	const voipActions = useVoipActions();

	useEffect(() => {
		if (!phones.length) return;

		(async () => {
			voipActions.setIsFetching(true);
			const response = await fetchGetAnalytics({
				date_start: date.start,
				date_end: date.end,
				phones,
				input: true,
				output: true,
			});

			setData(response?.data || null);
			voipActions.setConfig({ incoming: { page: 1 } });
			voipActions.setIsFetching(false);
		})();
	}, [date, phones, fetchGetAnalytics, voipActions]);

	return (
		<div>
			<Header title={isFullAccess ? 'Входящие звонки' : 'Мои звонки'} contentRight={<HeaderRight />} loading={isLoading || isFetching} />

			<VoipIncomingBoardsFeature
				answeredCount={data?.count_answered || null}
				missedCount={data?.count_missed || null}
				duration={data?.duration || null}
			/>
			<VoipIncomingListFeature answered={data?.answered ?? []} missed={data?.missed ?? []} />
		</div>
	);
};

export default Incoming;
