import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { isDesktop } from 'react-device-detect';
import { IP_WHITELIST } from '@fsd/shared/lib/hooks/use-client/config';

export const useClient = () => {
	const [ip, setIP] = useState<string>('');
	const isHttp = !window.location.protocol.includes('https');

	const skipLateness: boolean = useMemo(() => {
		if (!ip) {
			return false;
		}
		if (IP_WHITELIST.some((ipWl) => ip.includes(ipWl))) {
			return !isDesktop;
		}
		return !IP_WHITELIST.some((ipWl) => ip.includes(ipWl)) || !isDesktop || !isHttp;
	}, [ip, isHttp]);

	const getData = async () => {
		try {
			const res = await axios.get('https://api.ipify.org/?format=json');
			setIP(res?.data?.ip);
		} catch (e) {
			setIP('1');
		}
	};

	useEffect(() => {
		getData().then();
	}, []);

	return { ip, isDesktop, skipLateness };
};
