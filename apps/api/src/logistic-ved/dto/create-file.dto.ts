import { IsString, MinLength } from 'class-validator';
import { LogisticVedFileConstants } from '../constants/logistic-ved-file.constants';

export class CreateFileLogisticVedDto {
	@IsString({ message: LogisticVedFileConstants.VALIDATION_TYPE_TYPE })
	@MinLength(4, { message: LogisticVedFileConstants.VALIDATION_TYPE_LENGTH })
	type: string;

	@IsString({
		message: LogisticVedFileConstants.VALIDATION_URL_TYPE,
	})
	@MinLength(4, { message: LogisticVedFileConstants.VALIDATION_URL_LENGTH })
	url?: string;

	comment?: string;

	orderId: number;

	authorId: number;
}
