import { IsString } from 'class-validator';
import { LogisticVedHistoryConstants } from '../constants/logistic-ved-history.constants';

export class CreateHistoryLogisticVedDto {
	@IsString({ message: LogisticVedHistoryConstants.VALIDATION_TITLE_TYPE })
	title: string;

	@IsString({
		message: LogisticVedHistoryConstants.VALIDATION_DESCRIPTION_TYPE,
	})
	description: string;

	secret?: string;

	orderId: number;

	authorId: number;
}
