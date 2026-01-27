export interface IFeedDTO {
	organizationID: (number | string)[];
	contactID: (number | string)[];
	date?: string;
	take?: number;
}
