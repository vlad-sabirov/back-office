import { ChangeEvent, FC, useCallback } from 'react';
import { IFormDescriptionProps } from './form-description.types';
import { useValidation } from './use-validation';
import { Textarea } from '@fsd/shared/ui-kit';

export const FormDescription: FC<IFormDescriptionProps> = (props) => {
	const { value, onChange, error, setError, required } = props;
	const validation = useValidation();

	const handleChange = useCallback(
		(e: ChangeEvent<HTMLTextAreaElement>) => {
			if (error) {
				setError(null);
			}

			onChange(e.currentTarget.value);
		},
		[error, onChange, setError]
	);

	const handleValidation = useCallback(() => {
		setError(null);
		validation({ value, setError, required });
	}, [setError, validation, value, required]);

	return (
		<Textarea
			label={'Описание'}
			value={value}
			onChange={handleChange}
			onBlur={handleValidation}
			error={error}
			required={required}
		/>
	);
};
