import { FC, memo, useCallback } from 'react';
import { IFormNameRuProps } from './form-name-ru.types';
import { useValidate } from './useValidate';
import { Input } from '@fsd/shared/ui-kit';

export const FormNameRu: FC<IFormNameRuProps> = memo((props) => {
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
			label={'Название компании [RU]'}
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
FormNameRu.displayName = 'FormNameRu';
