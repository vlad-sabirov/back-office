import { ICrmOrganizationEntity } from '../../entity';

export interface IFindResponse {
	data: ICrmOrganizationEntity[];
	total: number;
	full?: number;
	medium?: number;
	low?: number;
	empty?: number;
}
