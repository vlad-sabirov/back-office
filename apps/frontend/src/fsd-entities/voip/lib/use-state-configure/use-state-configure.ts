import { useCallback, useEffect } from 'react';
import { addDays, format, subDays } from 'date-fns';
import { VoipService } from '@fsd/entities/voip';
import { useActions } from '@fsd/entities/voip/lib';
import { IVoipMissed } from '@fsd/entities/voip/model/voip-slice-init.types';
import { useStateSelector, useUser } from '@fsd/shared/lib/hooks';

export const useStateConfigure = () => {
	const { user } = useUser();
	const voipActions = useActions();
	const [fetchGetMissed] = VoipService.missingCalls();
	const staff = useStateSelector((state) => state.staff.data.voip);
	const org = useStateSelector((state) => state.crm_organization.data.voip);
	const cont = useStateSelector((state) => state.crm_contact.data.voip);
	const missedRefreshTimestamp = useStateSelector((state) => state.voip.refresh.missed);

	const getMissedCalls = useCallback(async () => {
		if (!user) return;
		voipActions.setIsFetching(true);
		const date_start = format(subDays(new Date(), 7), 'yyyy-MM-dd') + 'T00:00:00Z';
		const date_end = format(addDays(new Date(), 1), 'yyyy-MM-dd') + 'T00:00:00Z';
		const phones = [];
		if (user.phoneVoip) phones.push(String(user.phoneVoip));
		if (user.phoneMobile) phones.push(String(user.phoneMobile.slice(-9)));

		const response = await fetchGetMissed({ date_start, date_end, phones, skip_checked: true });
		voipActions.setIsFetching(false);
		if (!response.data) {
			voipActions.setDataMissed([]);
			return;
		}

		const missed: IVoipMissed[] = [];
		response.data.toReversed().forEach((data) => {
			let name = undefined;
			let type: IVoipMissed['type'] = 'other';
			let id: number | undefined = undefined;

			if (staff[data.caller]) {
				type = 'staff';
				name = staff[data.caller].name;
			} else if (org[data.caller]) {
				type = 'organization';
				name = org[data.caller].name;
				id = Number(org[data.caller].id);
			} else if (cont[data.caller]) {
				type = 'contact';
				name = cont[data.caller].name;
				id = Number(cont[data.caller].id);
			}

			missed.push({
				type,
				uuid: data.uuid,
				callerName: name,
				callerPhone: data.caller,
				timestamp: data.timestamp,
				phones: [data.caller],
				id,
			});
		});

		voipActions.setDataMissed(missed);
	}, [cont, fetchGetMissed, org, staff, user, voipActions]);

	useEffect(() => {
		getMissedCalls().then();
	}, [getMissedCalls, missedRefreshTimestamp]);

	useEffect(() => {
		setInterval(() => {
			voipActions.refresh('missed');
		}, 15000);
	}, [voipActions]);
};
