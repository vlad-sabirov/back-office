import { trim } from "lodash";
import { COMMENT_CONSTANTS } from ".";
import * as Types from "./comment.types";

export const commentValidate = async (
	{ form }: Types.CommentValidateT
): Promise<boolean>  => {
	const newComment = trim(form.values.comment.replace(/[^a-zA-Zа-яА-Я]/g, ''));

	if (newComment.length > 0 && newComment.length < 3) {
		form.setFieldError(
			COMMENT_CONSTANTS.FIELD_NAME, 
			COMMENT_CONSTANTS.VALIDATION.MIN_LENGTH_ERROR
		);
		return false;
	}

	if (newComment.length > 200) {
		form.setFieldError(
			COMMENT_CONSTANTS.FIELD_NAME,
			COMMENT_CONSTANTS.VALIDATION.MAX_LENGTH_ERROR
		);
		return false;
	}

	return true;
}
