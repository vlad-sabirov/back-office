import { FC, memo, useCallback } from "react";
import { Textarea } from "@fsd/shared/ui-kit";
import { IFormCommentProps } from "./form-comment.types";
import { useValidate } from "./useValidate";

export const FormComment: FC<IFormCommentProps> = memo((props) => {
	const { value, error, required, onChange, onError } = props;
	const validate = useValidate(props);

	const handleChange = useCallback((value: string) => {
		if (error) { onError(undefined); }
		onChange(value);
	}, [error, onChange, onError]);

	return (
		<Textarea
			label={'Комментарий'}
			value={value}
			onChange={(e) => handleChange(e.currentTarget.value)}
			onBlur={async () => { await validate(); }}
			error={error}
			required={required}
		/>
	);
});
FormComment.displayName = "FormComment";
