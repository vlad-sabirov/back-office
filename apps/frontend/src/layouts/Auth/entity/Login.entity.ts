export interface LoginEntityPayload {
	id: number;
	username: string;
	firstName: string;
	lastName: string;
	color: string;
	photo: string;
	phoneVoip: number;
	phoneMobile: number;
	roles: string[];
	accessToken?: string;
	parent?: number;
	child?: number[];
	isFired: boolean;
}

export interface LoginEntityToken {
	accessToken: string;
	refreshToken: string;
}

export interface LoginEntity {
	user: LoginEntityPayload;
	tokens: LoginEntityToken;
}
