import { useEffect } from 'react';
import { useStateSelector, useUser } from '@fsd/shared/lib/hooks';
import { useActions } from '../';

export const useCheckMyCall = () => {
	const events = useStateSelector((state) => state.voip.data.events);
	const myCall = useStateSelector((state) => state.voip.data.my);
	const myUUID = useStateSelector((state) => state.voip.callModal.uuid);
	const { user } = useUser();
	const actions = useActions();

	useEffect(() => {
		if (!user) {
			return;
		}
		let myMark = false;
		events.forEach((event) => {
			const myCall = event.users.find(
				(eventUser) => user.phoneMobile.includes(eventUser.caller) || user.phoneVoip == eventUser.caller
			);
			if (myCall) {
				actions.setDataMy(event);
				myMark = true;

				if (event.uuid != myUUID && myCall.role === 'receiver') {
					actions.setCallModalIsShow(true);
					actions.setCallModalUUID(event.uuid);
				}
			}
		});
		if (!myMark && myCall != null) {
			actions.setDataMy(null);
		}
	}, [actions, events, myCall, myUUID, user]);
};
