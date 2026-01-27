export interface IVoipInitialState {
	isLoading: boolean;
	isFetching: boolean;
	data: {
		my: IVoipEvent | null;
		events: IVoipEvent[];
		missed: IVoipMissed[];
	};
	callModal: {
		uuid: string;
		isShowModal: boolean;
	};
	refresh: IVoipRefresh;
	config: IVoipConfig;
}

export interface IVoipConfig {
	incoming: {
		date: {
			start: string;
			end: string;
		};
		page: number;
		limit: number;
	};
}

export interface IVoipRefresh {
	missed: string;
}

export interface IVoipEvent {
	call_id: string;
	uuid: string;
	type: string;
	did: string;
	queue: string;
	timestamp: string;
	users: IVoipEventUser[];
}

export interface IVoipEventUser {
	caller: string;
	uuid: string;
	role: string;
	mute: boolean;
}

export interface IVoipMissed {
	type: 'other' | 'staff' | 'organization' | 'contact';
	uuid: string;
	timestamp: string;
	callerName?: string;
	callerPhone?: string;
	phones: string[];
	id?: number;
}
