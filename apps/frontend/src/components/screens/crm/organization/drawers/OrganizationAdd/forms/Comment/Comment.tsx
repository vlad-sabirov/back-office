import { FC } from 'react';
import { Textarea } from '@fsd/shared/ui-kit';
import { CommentProps, FIELD_NAME_COMMENT } from '.';

export const Comment: FC<CommentProps> = ({ form, className }) => {
	return (
		<Textarea
			label={'Комментарий'}
			{...form.getInputProps(FIELD_NAME_COMMENT)}
			// onBlur={() => commentValidate({ form })}
			className={className}
		/>
	);
};
