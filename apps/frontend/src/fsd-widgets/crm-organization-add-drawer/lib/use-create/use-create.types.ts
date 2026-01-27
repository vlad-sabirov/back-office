export interface IUseCreateCleanData {
	organization: number | string | null;
	phones: (number | string)[];
	emails: (number | string)[];
	requisites: (number | string)[];
	contacts: [(number | string), string][];
}
