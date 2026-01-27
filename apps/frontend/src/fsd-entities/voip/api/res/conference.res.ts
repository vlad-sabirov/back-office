export interface ICallerConferenceResponse {
	code: number;
	status: string;
	timestamp: string;
	uuid: string;
	users: ICallerConferenceResponseUser[];
}

export interface ICallerConferenceResponseUser {
	caller: string;
	uuid: string;
	role: string;
	mute: boolean;
}
