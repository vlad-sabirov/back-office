import { FC, useState } from 'react';
import { IFormCommentProps } from './form-comment.types';
import { useValidate } from './useValidate';
import { useDebounce } from '@fsd/shared/lib/hooks';
import { Textarea } from '@fsd/shared/ui-kit';

export const FormComment: FC<IFormCommentProps> = (props) => {
	const { value, error, required, className, onChange, onError } = props;
	const [val, setVal] = useState<string>(value);
	const validate = useValidate(props);

	const handleChangeState = useDebounce((value: string) => {
		if (!onChange) {
			return;
		}
		onChange(value);
	}, 100);

	return (
		<Textarea
			label={'Комментарий'}
			value={val}
			onChange={(e) => {
				setVal(e.currentTarget.value);
				handleChangeState(e.currentTarget.value);
				if (error) {
					onError(undefined);
				}
			}}
			height={300}
			onBlur={async () => {
				await validate();
			}}
			className={className}
			error={error}
			required={required}
		/>
	);
};
