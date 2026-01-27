import { FC, memo, useCallback, useEffect } from 'react';
import { IFormInnProps } from './form-inn.types';
import { useValidate } from './useValidate';
import { Input } from '@fsd/shared/ui-kit';

export const FormInn: FC<IFormInnProps> = memo((props) => {
	const { value, error, required, onChange, onError } = props;
	const validate = useValidate(props);

	const handleChange = useCallback(
		(value: string) => {
			if (error) {
				onError(undefined);
			}
			onChange(value.replace(/\D/g, ''));
		},
		[error, onChange, onError]
	);

	return (
		<Input
			label={'ИНН'}
			value={!Number(value) ? undefined : value}
			onChange={(event) => {
				handleChange(event.currentTarget.value);
			}}
			onBlur={async () => {
				await validate();
			}}
			error={error}
			required={required}
		/>
	);
});
FormInn.displayName = 'FormInn';
