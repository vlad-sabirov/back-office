import { useCallback } from 'react';
import { VoipService, useVoipActions } from '@fsd/entities/voip';
import { useUser } from '@fsd/shared/lib/hooks';
import { showNotification } from '@mantine/notifications';

export const useCallP2P = () => {
	const [createP2PCallFetch] = VoipService.p2pCreate();
	const actionsVoip = useVoipActions();
	const { user } = useUser();

	return useCallback(
		async ({ caller, receiver }: { receiver: string; caller?: string }) => {
			actionsVoip.setIsFetching(true);
			const res = await createP2PCallFetch({ caller: caller || user?.phoneVoip || '', receiver });
			actionsVoip.setIsFetching(false);
			if ('error' in res) {
				// eslint-disable-next-line
				// @ts-ignore
				// noinspection JSUnresolvedReference
				showNotification({ color: 'red', message: res.error.data.message });
			}
		},
		[actionsVoip, createP2PCallFetch, user?.phoneVoip]
	);
};
