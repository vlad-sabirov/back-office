import { IsString, MinLength } from 'class-validator';
import { LogisticVedCommentConstants } from '../constants/logistic-ved-comment.constants';

export class UpdateCommentLogisticVedDto {
	@IsString({ message: LogisticVedCommentConstants.VALIDATION_COMMENT_TYPE })
	@MinLength(4, {
		message: LogisticVedCommentConstants.VALIDATION_COMMENT_LENGTH,
	})
	comment: string;

	orderId: number;

	authorId: number;
}
