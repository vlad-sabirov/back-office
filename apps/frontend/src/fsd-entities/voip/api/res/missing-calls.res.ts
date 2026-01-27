export interface IMissingCallsResponse extends ICall {
	stages: ICall[];
}

interface ICall {
	call_id: string;
	call_mark: string;
	call_type: string;
	caller: string;
	did: string;
	duration: number;
	file: string;
	queue: string;
	receiver: string;
	timestamp: 'string';
	uuid: 'string';
}
