export interface IVoipCallRecordingEntity extends IVoipCallRecording {
	stages: IVoipCallRecording[];
}

interface IVoipCallRecording {
	call_id: string;
	call_mark: string;
	call_type: string;
	caller: string;
	did: string;
	duration: number;
	file: string;
	is_answered: boolean;
	is_checked: boolean;
	queue: string;
	receiver: string;
	timestamp: string;
	uuid: string;
}
