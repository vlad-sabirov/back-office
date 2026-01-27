import { useCallback } from 'react';
import { VoipService, useVoipActions } from '@fsd/entities/voip';
import { useUser } from '@fsd/shared/lib/hooks';
import { showNotification } from '@mantine/notifications';

export const useCallConference = () => {
	const [fetchCreateConference] = VoipService.conferenceCreate();
	const actionsVoip = useVoipActions();
	const { user } = useUser();

	return useCallback(
		async (phones: string[]) => {
			if (!user) {
				return;
			}
			actionsVoip.setIsFetching(true);

			let phonesAll = [];
			if (user.phoneVoip) {
				phonesAll.push(user.phoneVoip);
			}
			if (phonesAll.length == 0 && user.phoneMobile) {
				phonesAll.push(user.phoneMobile);
			}
			phonesAll = phonesAll.concat(phones);

			if (phonesAll.length < 2) {
				showNotification({ color: 'red', message: 'Для конференции нужно больше участников' });
				actionsVoip.setIsFetching(false);
				return;
			}

			const res = await fetchCreateConference({ users: phonesAll });
			actionsVoip.setIsFetching(false);
			if ('error' in res) {
				// eslint-disable-next-line
				// @ts-ignore
				// noinspection JSUnresolvedReference
				showNotification({ color: 'red', message: res.error.data.message });
			}
		},
		[actionsVoip, fetchCreateConference, user]
	);
};
