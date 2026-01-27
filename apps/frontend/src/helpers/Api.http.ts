import axios, { AxiosRequestConfig } from 'axios';

const $api = axios.create({
	withCredentials: true,
	baseURL: '/api',
});

$api.interceptors.request.use((config: AxiosRequestConfig) => {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	config.headers!.Authorization = `Bearer ${localStorage.getItem('accessToken')}`;
	return config;
});

$api.interceptors.response.use(
	(config) => config,
	async (error) => {
		if (error.response.status === 401 && error.config && !error.config._isRetry) {
			error.config._isRetry = true;
			try {
				const response = await axios.get('/api/auth/refresh', { withCredentials: true });
				localStorage.setItem('accessToken', response.data.tokens.accessToken);
				return $api.request(error.config);
				// eslint-disable-next-line no-empty
			} catch (error) {}
		}
		throw error;
	}
);

export default $api;
