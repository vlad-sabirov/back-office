import { EnCrmHistoryEntities } from '../entity';

export interface IApiGetByEntity {
	entity: EnCrmHistoryEntities;
	id: string | number;
}

export interface IApiFeed {
	organizationID?: (number | string)[];
	contactID?: (number | string)[];
	date: string;
}
