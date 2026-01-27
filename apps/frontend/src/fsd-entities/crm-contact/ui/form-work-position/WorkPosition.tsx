import { FC, useCallback } from "react";
import { Input } from "@fsd/shared/ui-kit";
import { IFormWorkPositionProps } from "./form-work-position.types";
import { useValidate } from "./useValidate";

export const WorkPosition: FC<IFormWorkPositionProps> = (props) => {
	const { value, error, required, onChange, onError, className } = props;
	const validate = useValidate(props);

	const handleChange = useCallback((value: string) => {
		if (error) { onError(undefined); }
		onChange(value);
	}, [error, onChange, onError]);

	return (
		<Input
			label={'Должность'}
			value={value}
			onChange={(e) => handleChange(e.currentTarget.value)}
			onBlur={async () => { await validate(); }}
			className={className}
			error={error}
			required={required}
		/>
	);
}
