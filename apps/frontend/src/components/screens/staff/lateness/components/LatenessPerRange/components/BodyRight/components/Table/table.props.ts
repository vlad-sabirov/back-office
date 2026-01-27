import { LatenessDataResponse } from '@interfaces';

export interface TableProps {
	data: LatenessDataResponse;
	onSuccess?: () => void;
}
