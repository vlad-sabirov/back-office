export interface IReducer {
	isLoading: boolean;
	isFetching: boolean;
	reloadTimestamp: string;
	config: IReducerConfig;
}

interface IReducerConfig {
	organizationID: (number | string)[];
	contactID: (number | string)[];
}
