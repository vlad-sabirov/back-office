import { FC, memo, useCallback } from 'react';
import { IFormFirstDocumentProps } from './form-first-document.types';
import { useValidate } from './useValidate';
import { Input } from '@fsd/shared/ui-kit';

export const FormFirstDocument: FC<IFormFirstDocumentProps> = memo((props) => {
	const { value, error, required, onChange, onError } = props;
	const validate = useValidate(props);

	const handleChange = useCallback(
		(value: string) => {
			if (error) {
				onError(undefined);
			}
			onChange(value);
		},
		[error, onChange, onError]
	);

	return (
		<Input
			label={'Расходная накладная'}
			value={value}
			onChange={(e) => handleChange(e.currentTarget.value)}
			onBlur={async () => {
				await validate();
			}}
			error={error}
			required={required}
		/>
	);
});
FormFirstDocument.displayName = 'FormFirstDocument';
