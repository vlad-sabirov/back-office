import { FC, useEffect, useState } from 'react';
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

	const voipActions = useVoipActions();

	useEffect(() => {
		(async () => {
			voipActions.setIsFetching(true);
			const response = await fetchGetAnalytics({
				date_start: date.start,
				date_end: date.end,
				phones: ALL_COMPANY_PHONES,
				input: true,
				output: true,
			});
			setData(response?.data || null);
			voipActions.setConfig({ incoming: { page: 1 } });
			voipActions.setIsFetching(false);
		})();
	}, [date, fetchGetAnalytics, voipActions]);

	const incomingAnsweredCount = data?.answered?.filter((c) => c.caller.length > 6).length ?? null;

	return (
		<div>
			<Header title={isFullAccess ? 'Телефония' : user?.child?.length ? 'Звонки моей команды' : 'Мои звонки'} contentRight={<HeaderRight />} loading={isLoading || isFetching} />

			<VoipIncomingBoardsFeature
				answeredCount={incomingAnsweredCount}
				missedCount={data?.count_missed || null}
				duration={data?.duration || null}
			/>
			<VoipIncomingListFeature answered={data?.answered ?? []} missed={data?.missed ?? []} />
		</div>
	);
};

export default Incoming;
