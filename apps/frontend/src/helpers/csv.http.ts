import axios from 'axios';

export const httpCsv = axios.create({
	withCredentials: true,
	baseURL: '/csv',
});
