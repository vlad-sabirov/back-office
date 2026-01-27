import { useCallback, useEffect } from 'react';
import { useActions } from '@fsd/entities/voip/lib';
import { delay } from '@helpers';
import { IVoipEvent } from '../../model/voip-slice-init.types';

export const useWsClient = () => {
	const actions = useActions();

	const wsConnect = useCallback(() => {
		const isHttp = !window.location.protocol.includes('https');
		const events = new WebSocket(`${isHttp ? 'ws' : 'wss'}://${window.location.host}/api/voip/events/`);
		events.onmessage = (event) => {
			if (!event.data) {
				return;
			}
			const callerIds: string[] = [];
			const data = JSON.parse(event.data) as IVoipEvent[];
			actions.setDataEvents(
				data.filter((event) => {
					if (callerIds.includes(event.call_id)) {
						return false;
					}
					callerIds.push(event.call_id);
					return true;
				})
			);
		};
		events.onclose = async () => {
			wsConnect();
			await delay(1000);
		};
		return () => {
			events.close(1000, 'Закрыто по запросу пользователя');
		};
	}, [actions]);

	useEffect(() => {
		wsConnect();
	}, [wsConnect]);
};
