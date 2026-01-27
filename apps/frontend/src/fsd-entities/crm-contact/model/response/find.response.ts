import { ICrmContactEntity } from '../../entity';

export interface IFindResponse {
	data: ICrmContactEntity[];
	total: number;
	full?: number;
	medium?: number;
	low?: number;
	empty?: number;
}
