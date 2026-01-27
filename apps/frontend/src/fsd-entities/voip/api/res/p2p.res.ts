export interface ICallerP2PResponse {
	code: number;
	status: string;
	timestamp: string;
	uuid: string;
	users: ICallerP2PResponseUser[];
}

export interface ICallerP2PResponseUser {
	caller: string;
	uuid: string;
	role: string;
	mute: boolean;
}
