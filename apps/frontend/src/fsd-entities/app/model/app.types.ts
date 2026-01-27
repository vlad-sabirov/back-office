export interface IAppReducer {
	auth: {
		isLoading: boolean;
		isAuth: boolean;
		isFired: boolean;
		userId: number | string | null;
		parentId: number | string | null;
		firstName: string | null;
		lastName: string | null;
		color: string | null;
		photo: string | null;
		team: number[] | string[] | null;
		roles: string[] | null; 
		phone: {
			voip: string | null;
			mobile: string | null;
		}
		
		username: string | null;
		password: string | null;
		step: number;
		pinCode: number | string | null;
		hard?: boolean;
	}
}
