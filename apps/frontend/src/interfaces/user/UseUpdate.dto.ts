export interface IUserUpdateDto {
	userDto?: {
		username?: string;
		password?: string;
		firstName?: string;
		lastName?: string;
		surName?: string;
		workPosition?: string;
		birthday?: string;
		sex?: string;
		photo?: string;
		color?: string;
		telegramId?: string;
		phoneVoip?: string;
		phoneMobile?: string;
		email?: string;
		telegram?: string;
		facebook?: string;
		instagram?: string;
		isFixLate?: boolean;
		isFired?: boolean;
		position?: number;
		lastLogin?: string;
		departmentId?: number;
		territoryId?: number;
		isFirstLogin?: boolean;
	};
}
