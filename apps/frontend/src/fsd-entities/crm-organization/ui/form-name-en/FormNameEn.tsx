import { FC, memo, useCallback } from 'react';
import { IFormNameEnProps } from './form-name-en.types';
import { useValidate } from './useValidate';
import { Input } from '@fsd/shared/ui-kit';

export const FormNameEn: FC<IFormNameEnProps> = memo((props) => {
	const { value, error, required, onChange, onError, className } = props;
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
			label={'Название компании [EN]'}
			value={value}
			onChange={(e) => handleChange(e.currentTarget.value)}
			onBlur={async () => {
				await validate();
			}}
			className={className}
			error={error}
			required={required}
		/>
	);
});
FormNameEn.displayName = 'FormNameEn';
