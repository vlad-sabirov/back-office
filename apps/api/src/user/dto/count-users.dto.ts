export interface CountUsersDto {
	sex?: 'male' | 'female';
	departmentId?: number;
	territoryId?: number;
	isFiredIncluded?: boolean;
}
