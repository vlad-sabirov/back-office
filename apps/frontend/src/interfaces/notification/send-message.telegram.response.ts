interface Form {
	id: number;
	username: string;
}

interface Chat {
	id: number;
	username: string;
}

export interface ISendMessageTelegramResponse {
	message_id: number;
	from: Form;
	chat: Chat;
	date: number;
	text: string;
}
