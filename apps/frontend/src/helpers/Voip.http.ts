import axios from 'axios';

const $voip = axios.create({
	withCredentials: true,
	baseURL: '/voip',
});

export default $voip;
