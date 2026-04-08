import { FC, useEffect, useMemo, useState } from 'react';
import { VoipService, useVoipActions } from '@fsd/entities/voip';
import { IAnalyticsResponse } from '@fsd/entities/voip/api/res/analytics.res';
import { useStateSelector, useUser } from '@fsd/shared/lib/hooks';
import { Header } from '@fsd/shared/ui-kit';
import { VoipIncomingDateWidget } from '@fsd/widgets/voip-incoming-date';
import { OutgoingList } from '../_outgoing-list/OutgoingList';
import { OutgoingBoards } from '../_outgoing-boards/OutgoingBoards';

const FULL_ACCESS_ROLES = ['developer', 'boss'];

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

const Outgoing: FC = () => {
	const isLoading = useStateSelector((state) => state.voip.isLoading);
	const isFetching = useStateSelector((state) => state.voip.isFetching);
	const date = useStateSelector((state) => state.voip.config.incoming.date);
	const staffVoipKeys = useStateSelector((state) => Object.keys(state.staff.data.voip).join(','));
	const [fetchGetAnalytics] = VoipService.analytics();
	const [data, setData] = useState<IAnalyticsResponse | null>(null);

	const { user, getRoles, getParent } = useUser();
	const roles = getRoles();
	const isFullAccess = roles?.some((role) => FULL_ACCESS_ROLES.includes(role)) ?? false;
	const parent = getParent();
	const childPhonesKey = user?.child?.map((c) => c.phoneVoip).join(',') ?? '';

	const staffPhones = useMemo(() => {
		if (isFullAccess) return staffVoipKeys.split(',').filter(Boolean);
		return [user?.phoneVoip, ...(user?.child?.map((c) => c.phoneVoip) ?? []), parent?.phoneVoip].filter(
			Boolean,
		) as string[];
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isFullAccess, staffVoipKeys, user?.phoneVoip, childPhonesKey, parent?.phoneVoip]);

	const phones = useMemo(
		() => [...new Set([...ALL_COMPANY_PHONES, ...staffPhones])],
		[staffPhones],
	);

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

	const outgoing = data?.answered?.filter((c) => c.caller.length <= 6) ?? [];

	return (
		<div>
			<Header
				title={isFullAccess ? 'Исходящие звонки' : user?.child?.length ? 'Исходящие моей команды' : 'Мои исходящие'}
				contentRight={<VoipIncomingDateWidget maxDate={new Date()} minDate={new Date('2023-7-7')} />}
				loading={isLoading || isFetching}
			/>
			<OutgoingBoards count={outgoing.length} duration={data?.duration || null} />
			<OutgoingList calls={outgoing} />
		</div>
	);
};

export default Outgoing;
