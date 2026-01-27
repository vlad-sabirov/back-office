import { FC, memo, useCallback } from "react";
import { Input } from "@fsd/shared/ui-kit";
import { IFormNameProps } from "./form-name.types";
import { useValidate } from "./useValidate";

export const FormName: FC<IFormNameProps> = memo((props) => {
	const { value, error, required, onChange, onError, className } = props;
	const validate = useValidate(props);

	const handleChange = useCallback((value: string) => {
		if (error) { onError(undefined); }
		onChange(value);
	}, [error, onChange, onError]);

	return (
		<Input
			label={'ФИО'}
			value={value}
			onChange={(e) => handleChange(e.currentTarget.value)}
			onBlur={async () => { await validate(); }}
			className={className}
			error={error}
			required={required}
		/>
	);
});
FormName.displayName = "FormName";
