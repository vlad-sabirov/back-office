import { FC, useCallback } from 'react';
import { IFormNameProps } from './form-name.types';
import { useValidation } from './use-validation';
import { Input } from '@fsd/shared/ui-kit';

export const FormName: FC<IFormNameProps> = (props) => {
	const { value, onChange, required, error, setError } = props;
	const validation = useValidation();

	const handleChange = useCallback(
		(val: string) => {
			if (error) {
				setError(null);
			}

			onChange(val);
		},
		[error, onChange, setError]
	);

	const handleValidation = useCallback(() => {
		setError(null);
		validation({ value, setError, required });
	}, [setError, validation, value, required]);

	return (
		<Input
			label={'Название задачи'}
			value={value}
			onChange={(e) => handleChange(e.currentTarget.value)}
			onBlur={handleValidation}
			required={required}
			error={error}
		/>
	);
};
