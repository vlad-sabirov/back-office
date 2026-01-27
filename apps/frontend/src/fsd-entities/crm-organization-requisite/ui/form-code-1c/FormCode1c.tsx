import { FC, memo, useCallback } from 'react';
import { IFormCode1cProps } from './form-code-1c.types';
import { useValidate } from './useValidate';
import { Input } from '@fsd/shared/ui-kit';

export const FormCode1c: FC<IFormCode1cProps> = memo((props) => {
	const { value, error, required, onChange, onError } = props;
	const validate = useValidate(props);

	const handleChange = useCallback(
		(value: string) => {
			if (error) {
				onError(undefined);
			}
			onChange(value.replace(/[^a-zA-Zа-яА-ЯёЁ0-9-_]/gu, ''));
		},
		[error, onChange, onError]
	);

	return (
		<Input
			label={'Код 1С'}
			value={value}
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
FormCode1c.displayName = 'FormInn';
