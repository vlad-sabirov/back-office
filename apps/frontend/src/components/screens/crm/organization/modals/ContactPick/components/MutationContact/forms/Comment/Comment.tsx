import { FC } from 'react';
import { Textarea } from '@fsd/shared/ui-kit';
import { commentValidate, COMMENT_CONSTANTS } from '.';
import * as Types from './comment.types';

export const Comment: FC<Types.CommentT> = ({ form, className }) => {
	return (
		<Textarea
			label={'Комментарий'}
			{...form.getInputProps(COMMENT_CONSTANTS.FIELD_NAME)}
			onBlur={() => commentValidate({ form })}
			className={className}
		/>
	);
};
